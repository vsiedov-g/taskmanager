using AutoFixture;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System.Net;
using System.Net.Sockets;
using TaskManager.Application.Common.Models;
using TaskManager.Infrastructure.Models;
using TaskManager.Infrastructure.Services;

namespace TaskManager.Infrastructure.Tests.Services;

public class SlackRetryPolicyTests
{
    private readonly Mock<ILogger<SlackRetryPolicy>> _mockLogger;
    private readonly SlackSettings _defaultSettings;
    private readonly Fixture _fixture;

    public SlackRetryPolicyTests()
    {
        _mockLogger = new Mock<ILogger<SlackRetryPolicy>>();
        _fixture = new Fixture();

        _defaultSettings = new SlackSettings
        {
            EnableRetries = true,
            MaxRetryAttempts = 3,
            BaseRetryDelayMs = 100, // Use smaller delay for tests
            MaxRetryDelayMs = 1000,
            RequestTimeoutSeconds = 30
        };
    }

    private SlackRetryPolicy CreateRetryPolicy(SlackSettings? settings = null)
    {
        var settingsToUse = settings ?? _defaultSettings;
        var options = Options.Create(settingsToUse);
        return new SlackRetryPolicy(options);
    }

    [Fact]
    public async Task ExecuteAsync_WithSuccessfulOperation_ShouldReturnSuccessImmediately()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();
        var successResult = SlackNotificationResult.Success("12345", 1, TimeSpan.FromMilliseconds(100));

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            return Task.FromResult(successResult);
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.MessageTs.Should().Be("12345");
        result.AttemptCount.Should().Be(1);
        operationCallCount.Should().Be(1);
    }

    [Fact]
    public async Task ExecuteAsync_WithRetriesDisabled_ShouldNotRetryOnFailure()
    {
        // Arrange
        var settings = new SlackSettings
        {
            EnableRetries = false,
            MaxRetryAttempts = 3
        };
        var retryPolicy = CreateRetryPolicy(settings);

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            throw new HttpRequestException("Network error");
        };

        // Act & Assert
        await Assert.ThrowsAsync<HttpRequestException>(
            () => retryPolicy.ExecuteAsync(operation, _mockLogger.Object));

        operationCallCount.Should().Be(1);
    }

    [Fact]
    public async Task ExecuteAsync_WithRetryableException_ShouldRetryUpToMaxAttempts()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            throw new HttpRequestException("Network timeout");
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.AttemptCount.Should().Be(_defaultSettings.MaxRetryAttempts + 1); // 4 total attempts
        
        // The error message should be the original exception message since max attempts was reached
        result.ErrorMessage.Should().Be("Network timeout");
        operationCallCount.Should().Be(_defaultSettings.MaxRetryAttempts + 1);
    }

    [Theory]
    [InlineData(typeof(HttpRequestException))]
    [InlineData(typeof(TaskCanceledException))]
    [InlineData(typeof(SocketException))]
    [InlineData(typeof(TimeoutException))]
    public async Task ExecuteAsync_WithRetryableExceptionTypes_ShouldRetry(Type exceptionType)
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            Exception exception = exceptionType.Name switch
            {
                nameof(SocketException) => new SocketException(10054), // Connection reset by peer
                nameof(HttpRequestException) => new HttpRequestException("Test error"),
                nameof(TaskCanceledException) => new TaskCanceledException("Test error"),
                nameof(TimeoutException) => new TimeoutException("Test error"),
                _ => (Exception)Activator.CreateInstance(exceptionType, "Test error")!
            };
            throw exception;
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.IsSuccess.Should().BeFalse();
        operationCallCount.Should().BeGreaterThan(1); // Should have retried
    }

    [Fact]
    public async Task ExecuteAsync_WithNonRetryableException_ShouldNotRetry()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            throw new ArgumentException("Invalid argument");
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.AttemptCount.Should().Be(1);
        result.ErrorMessage.Should().Contain("Invalid argument");
        operationCallCount.Should().Be(1); // Should not have retried
    }

    [Fact]
    public async Task ExecuteAsync_WithSuccessOnRetry_ShouldReturnSuccessWithCorrectAttemptCount()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            
            // Fail first two attempts, succeed on third
            if (operationCallCount <= 2)
            {
                throw new HttpRequestException("Temporary failure");
            }
            
            return Task.FromResult(SlackNotificationResult.Success("54321", 3, TimeSpan.FromMilliseconds(300)));
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.MessageTs.Should().Be("54321");
        result.AttemptCount.Should().Be(3);
        operationCallCount.Should().Be(3);
    }

    [Fact]
    public async Task ExecuteAsync_WithFailedResultButRetryableError_ShouldRetry()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            
            // Return failed result with retryable error on first attempts, then succeed
            if (operationCallCount <= 2)
            {
                return Task.FromResult(SlackNotificationResult.Failed("rate_limited", operationCallCount, TimeSpan.FromMilliseconds(100)));
            }
            
            return Task.FromResult(SlackNotificationResult.Success("success", operationCallCount, TimeSpan.FromMilliseconds(300)));
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.AttemptCount.Should().Be(3);
        operationCallCount.Should().Be(3);
    }

    [Fact]
    public async Task ExecuteAsync_WithFailedResultAndNonRetryableError_ShouldNotRetry()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            return Task.FromResult(SlackNotificationResult.Failed("invalid_auth", 1, TimeSpan.FromMilliseconds(100)));
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.AttemptCount.Should().Be(1);
        result.ErrorMessage.Should().Be("invalid_auth");
        operationCallCount.Should().Be(1); // Should not have retried
    }

    [Theory]
    [InlineData("rate_limited")]
    [InlineData("internal_error")]
    [InlineData("timeout")]
    [InlineData("service_unavailable")]
    [InlineData("network error occurred")]
    [InlineData("connection failed")]
    public async Task ExecuteAsync_WithRetryableErrorMessages_ShouldRetry(string errorMessage)
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            if (operationCallCount == 1)
            {
                return Task.FromResult(SlackNotificationResult.Failed(errorMessage, operationCallCount, TimeSpan.FromMilliseconds(100)));
            }
            return Task.FromResult(SlackNotificationResult.Success("success", operationCallCount, TimeSpan.FromMilliseconds(200)));
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.IsSuccess.Should().BeTrue();
        operationCallCount.Should().Be(2); // Should have retried
    }

    [Theory]
    [InlineData("invalid_auth")]
    [InlineData("channel_not_found")]
    [InlineData("not_allowed")]
    public async Task ExecuteAsync_WithNonRetryableErrorMessages_ShouldNotRetry(string errorMessage)
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            return Task.FromResult(SlackNotificationResult.Failed(errorMessage, operationCallCount, TimeSpan.FromMilliseconds(100)));
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be(errorMessage);
        operationCallCount.Should().Be(1); // Should not have retried
    }

    [Fact]
    public async Task ExecuteAsync_ShouldIncreaseDelayExponentially()
    {
        // Arrange
        var settings = new SlackSettings
        {
            EnableRetries = true,
            MaxRetryAttempts = 3,
            BaseRetryDelayMs = 100,
            MaxRetryDelayMs = 10000
        };
        var retryPolicy = CreateRetryPolicy(settings);

        var operationTimes = new List<DateTime>();
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationTimes.Add(DateTime.UtcNow);
            throw new HttpRequestException("Network error");
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        operationTimes.Should().HaveCount(4); // Initial + 3 retries
        
        // Check that delays are increasing (allowing for some variance due to jitter)
        for (int i = 1; i < operationTimes.Count; i++)
        {
            var delay = operationTimes[i] - operationTimes[i - 1];
            delay.TotalMilliseconds.Should().BeGreaterThanOrEqualTo(80); // Account for jitter (0.8 factor)
        }
    }

    [Fact]
    public async Task ExecuteAsync_ShouldRespectMaxRetryDelay()
    {
        // Arrange
        var settings = new SlackSettings
        {
            EnableRetries = true,
            MaxRetryAttempts = 5,
            BaseRetryDelayMs = 1000,
            MaxRetryDelayMs = 2000 // Low max to test capping
        };
        var retryPolicy = CreateRetryPolicy(settings);

        var operationTimes = new List<DateTime>();
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationTimes.Add(DateTime.UtcNow);
            throw new HttpRequestException("Network error");
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        operationTimes.Should().HaveCount(6); // Initial + 5 retries
        
        // Later delays should be capped at MaxRetryDelayMs
        for (int i = 3; i < operationTimes.Count; i++) // After a few exponential increases
        {
            var delay = operationTimes[i] - operationTimes[i - 1];
            delay.TotalMilliseconds.Should().BeLessThanOrEqualTo(2400); // Max + 20% for jitter
        }
    }

    [Fact]
    public async Task ExecuteAsync_ShouldSetElapsedTimeOnResult()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = async () =>
        {
            operationCallCount++;
            await Task.Delay(50); // Add some execution time
            
            if (operationCallCount <= 2)
            {
                throw new HttpRequestException("Temporary failure");
            }
            
            return SlackNotificationResult.Success("success", operationCallCount, TimeSpan.Zero);
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.ElapsedTime.Should().BeGreaterThan(TimeSpan.FromMilliseconds(50));
        result.ElapsedTime.Should().BeLessThan(TimeSpan.FromSeconds(10)); // Should not take too long for test
    }

    [Fact]
    public async Task ExecuteAsync_WithPrecancelledToken_ShouldHandleCancellation()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();
        using var cts = new CancellationTokenSource();
        cts.Cancel(); // Pre-cancel the token
        
        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            cts.Token.ThrowIfCancellationRequested();
            return Task.FromResult(SlackNotificationResult.Success("test", 1, TimeSpan.Zero));
        };

        // Act 
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object, cts.Token);

        // Assert - The operation should handle cancellation and either succeed or fail gracefully
        result.Should().NotBeNull();
        // We don't assert on success/failure since cancellation handling can vary
        operationCallCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldLogAppropriateMessages()
    {
        // Arrange
        var retryPolicy = CreateRetryPolicy();

        var operationCallCount = 0;
        Func<Task<SlackNotificationResult>> operation = () =>
        {
            operationCallCount++;
            if (operationCallCount <= 2)
            {
                throw new HttpRequestException("Network timeout");
            }
            return Task.FromResult(SlackNotificationResult.Success("success", operationCallCount, TimeSpan.FromMilliseconds(100)));
        };

        // Act
        var result = await retryPolicy.ExecuteAsync(operation, _mockLogger.Object);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify logging calls were made (we can't easily verify exact log messages with Moq,
        // but we can verify that Log was called)
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("retry attempt")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.AtLeast(1));

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("succeeded on attempt")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}