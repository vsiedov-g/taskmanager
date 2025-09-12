using AutoFixture;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;
using System.Text.Json;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.Common.Models;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Models;
using TaskManager.Infrastructure.Services;
using TaskManager.Infrastructure.Tests.Common;

namespace TaskManager.Infrastructure.Tests.Services;

public class SlackNotifierServiceTests
{
    private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
    private readonly Mock<ISlackMessageBuilder> _mockMessageBuilder;
    private readonly Mock<ISlackRetryPolicy> _mockRetryPolicy;
    private readonly Mock<ILogger<SlackNotifierService>> _mockLogger;
    private readonly HttpClient _httpClient;
    private readonly SlackSettings _slackSettings;
    private readonly SlackNotifierService _slackNotifier;
    private readonly Fixture _fixture;

    public SlackNotifierServiceTests()
    {
        _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        _mockMessageBuilder = new Mock<ISlackMessageBuilder>();
        _mockRetryPolicy = new Mock<ISlackRetryPolicy>();
        _mockLogger = new Mock<ILogger<SlackNotifierService>>();
        _fixture = FixtureExtensions.CreateSlackFixture();

        _httpClient = new HttpClient(_mockHttpMessageHandler.Object);

        _slackSettings = new SlackSettings
        {
            WebhookUrl = "https://hooks.slack.com/services/test/webhook",
            Channel = "#test-channel",
            EnableNotifications = true,
            EnableRetries = true,
            MaxRetryAttempts = 3,
            RequestTimeoutSeconds = 30
        };

        var options = Options.Create(_slackSettings);
        _slackNotifier = new SlackNotifierService(
            _httpClient,
            _mockMessageBuilder.Object,
            _mockRetryPolicy.Object,
            options,
            _mockLogger.Object);
    }


    [Fact]
    public async Task SendActivityNotificationAsync_WithNotificationsDisabled_ShouldReturnSkipped()
    {
        // Arrange
        var disabledSettings = new SlackSettings
        {
            EnableNotifications = false,
            WebhookUrl = "https://hooks.slack.com/services/test/webhook"
        };

        var options = Options.Create(disabledSettings);
        var slackNotifier = new SlackNotifierService(
            _httpClient,
            _mockMessageBuilder.Object,
            _mockRetryPolicy.Object,
            options,
            _mockLogger.Object);

        var activityLog = _fixture.Create<ActivityLog>();

        // Act
        var result = await slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Not configured");
        result.AttemptCount.Should().Be(0);

        _mockMessageBuilder.Verify(mb => mb.BuildActivityMessageAsync(It.IsAny<ActivityLog>()), Times.Never);
        _mockRetryPolicy.Verify(
            rp => rp.ExecuteAsync(It.IsAny<Func<Task<SlackNotificationResult>>>(), It.IsAny<ILogger>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SendActivityNotificationAsync_WithInvalidWebhookUrl_ShouldReturnSkipped()
    {
        // Arrange
        var invalidSettings = new SlackSettings
        {
            EnableNotifications = true,
            WebhookUrl = "invalid-url"
        };

        var options = Options.Create(invalidSettings);
        var slackNotifier = new SlackNotifierService(
            _httpClient,
            _mockMessageBuilder.Object,
            _mockRetryPolicy.Object,
            options,
            _mockLogger.Object);

        var activityLog = _fixture.Create<ActivityLog>();

        // Act
        var result = await slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Not configured");
    }

    [Fact]
    public async Task SendActivityNotificationAsync_WithEmptyWebhookUrl_ShouldReturnSkipped()
    {
        // Arrange
        var emptyWebhookSettings = new SlackSettings
        {
            EnableNotifications = true,
            WebhookUrl = ""
        };

        var options = Options.Create(emptyWebhookSettings);
        var slackNotifier = new SlackNotifierService(
            _httpClient,
            _mockMessageBuilder.Object,
            _mockRetryPolicy.Object,
            options,
            _mockLogger.Object);

        var activityLog = _fixture.Create<ActivityLog>();

        // Act
        var result = await slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Not configured");
    }

    [Fact]
    public async Task SendActivityNotificationAsync_WhenRetryPolicyThrowsException_ShouldReturnFailedResult()
    {
        // Arrange
        var activityLog = _fixture.Create<ActivityLog>();
        var slackMessage = new SlackMessage
        {
            Text = "Test message",
            Channel = "#test-channel"
        };

        _mockMessageBuilder
            .Setup(mb => mb.BuildActivityMessageAsync(activityLog))
            .ReturnsAsync(slackMessage);

        var expectedException = new HttpRequestException("Network failure");
        _mockRetryPolicy
            .Setup(rp => rp.ExecuteAsync(
                It.IsAny<Func<Task<SlackNotificationResult>>>(),
                _mockLogger.Object,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        // Act
        var result = await _slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Network failure");
        result.AttemptCount.Should().Be(_slackSettings.MaxRetryAttempts);
    }

    [Fact]
    public async Task IsConfiguredAsync_WithValidWebhookUrl_ShouldReturnTrue()
    {
        // Act
        var result = await _slackNotifier.IsConfiguredAsync();

        // Assert
        result.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid-url")]
    [InlineData("https://example.com/webhook")]
    [InlineData("http://hooks.slack.com/services/test")]
    public async Task IsConfiguredAsync_WithInvalidWebhookUrl_ShouldReturnFalse(string invalidUrl)
    {
        // Arrange
        var invalidSettings = new SlackSettings
        {
            WebhookUrl = invalidUrl
        };

        var options = Options.Create(invalidSettings);
        var slackNotifier = new SlackNotifierService(
            _httpClient,
            _mockMessageBuilder.Object,
            _mockRetryPolicy.Object,
            options,
            _mockLogger.Object);

        // Act
        var result = await slackNotifier.IsConfiguredAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TestConnectionAsync_WithValidConfiguration_ShouldReturnTrue()
    {
        // Arrange
        var responseMessage = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("ok")
        };

        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.Method == HttpMethod.Post &&
                    req.RequestUri!.ToString() == _slackSettings.WebhookUrl),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(responseMessage);

        // Act
        var result = await _slackNotifier.TestConnectionAsync();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TestConnectionAsync_WithHttpError_ShouldReturnFalse()
    {
        // Arrange
        var responseMessage = new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent("Invalid request")
        };

        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(responseMessage);

        // Act
        var result = await _slackNotifier.TestConnectionAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TestConnectionAsync_WithException_ShouldReturnFalse()
    {
        // Arrange
        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ThrowsAsync(new HttpRequestException("Network error"));

        // Act
        var result = await _slackNotifier.TestConnectionAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TestConnectionAsync_WithNotConfigured_ShouldReturnFalse()
    {
        // Arrange
        var notConfiguredSettings = new SlackSettings
        {
            WebhookUrl = ""
        };

        var options = Options.Create(notConfiguredSettings);
        var slackNotifier = new SlackNotifierService(
            _httpClient,
            _mockMessageBuilder.Object,
            _mockRetryPolicy.Object,
            options,
            _mockLogger.Object);

        // Act
        var result = await slackNotifier.TestConnectionAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TestConnectionAsync_ShouldSendCorrectTestPayload()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        var responseMessage = new HttpResponseMessage(HttpStatusCode.OK);

        _mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>((request, token) =>
            {
                capturedRequest = request;
            })
            .ReturnsAsync(responseMessage);

        // Act
        await _slackNotifier.TestConnectionAsync();

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.ToString().Should().Be(_slackSettings.WebhookUrl);
        capturedRequest.Content.Should().NotBeNull();

        var content = await capturedRequest.Content!.ReadAsStringAsync();
        var payload = JsonSerializer.Deserialize<JsonElement>(content);
        payload.GetProperty("text").GetString().Should().Be("Test connection from Task Manager");
    }

    [Fact]
    public void Constructor_ShouldConfigureHttpClientTimeout()
    {
        // Assert
        _httpClient.Timeout.Should().Be(TimeSpan.FromSeconds(_slackSettings.RequestTimeoutSeconds));
    }

    [Fact]
    public async Task SendActivityNotificationAsync_ShouldLogCorrelationId()
    {
        // Arrange
        var activityLog = _fixture.Create<ActivityLog>();
        var slackMessage = new SlackMessage { Text = "Test message" };
        var expectedResult = SlackNotificationResult.Success("12345", 1, TimeSpan.FromMilliseconds(100));

        _mockMessageBuilder
            .Setup(mb => mb.BuildActivityMessageAsync(activityLog))
            .ReturnsAsync(slackMessage);

        _mockRetryPolicy
            .Setup(rp => rp.ExecuteAsync(
                It.IsAny<Func<Task<SlackNotificationResult>>>(),
                _mockLogger.Object,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        await _slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Starting Slack notification for activity {activityLog.Id}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SendActivityNotificationAsync_WithSuccessfulResult_ShouldLogSuccess()
    {
        // Arrange
        var activityLog = _fixture.Create<ActivityLog>();
        var slackMessage = new SlackMessage { Text = "Test message" };
        var successResult = SlackNotificationResult.Success("12345", 2, TimeSpan.FromMilliseconds(250));

        _mockMessageBuilder
            .Setup(mb => mb.BuildActivityMessageAsync(activityLog))
            .ReturnsAsync(slackMessage);

        _mockRetryPolicy
            .Setup(rp => rp.ExecuteAsync(
                It.IsAny<Func<Task<SlackNotificationResult>>>(),
                _mockLogger.Object,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(successResult);

        // Act
        await _slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Slack notification sent successfully") && 
                                             v.ToString()!.Contains("2 attempts")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SendActivityNotificationAsync_WithFailedResult_ShouldLogWarning()
    {
        // Arrange
        var activityLog = _fixture.Create<ActivityLog>();
        var slackMessage = new SlackMessage { Text = "Test message" };
        var failedResult = SlackNotificationResult.Failed("Rate limited", 3, TimeSpan.FromMilliseconds(500));

        _mockMessageBuilder
            .Setup(mb => mb.BuildActivityMessageAsync(activityLog))
            .ReturnsAsync(slackMessage);

        _mockRetryPolicy
            .Setup(rp => rp.ExecuteAsync(
                It.IsAny<Func<Task<SlackNotificationResult>>>(),
                _mockLogger.Object,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(failedResult);

        // Act
        await _slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Slack notification failed") && 
                                             v.ToString()!.Contains("3 attempts") &&
                                             v.ToString()!.Contains("Rate limited")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}