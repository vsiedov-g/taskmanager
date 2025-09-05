using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.Common.Models;
using TaskManager.Infrastructure.Models;

namespace TaskManager.Infrastructure.Services;

public class SlackRetryPolicy : ISlackRetryPolicy
{
    private readonly SlackSettings _settings;

    public SlackRetryPolicy(IOptions<SlackSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task<SlackNotificationResult> ExecuteAsync(
        Func<Task<SlackNotificationResult>> operation,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.EnableRetries)
        {
            return await operation();
        }

        var attempt = 0;
        var exceptions = new List<Exception>();
        var stopwatch = Stopwatch.StartNew();

        while (attempt <= _settings.MaxRetryAttempts)
        {
            try
            {
                if (attempt > 0)
                {
                    var delay = CalculateDelay(attempt);
                    logger.LogInformation(
                        "Slack notification retry attempt {Attempt} after {Delay}ms delay",
                        attempt, delay.TotalMilliseconds);

                    await Task.Delay(delay, cancellationToken);
                }

                var result = await operation();
                
                if (result.IsSuccess)
                {
                    result.AttemptCount = attempt + 1;
                    result.ElapsedTime = stopwatch.Elapsed;
                    
                    if (attempt > 0)
                    {
                        logger.LogInformation(
                            "Slack notification succeeded on attempt {Attempt} after {ElapsedMs}ms",
                            attempt + 1, stopwatch.ElapsedMilliseconds);
                    }
                    
                    return result;
                }

                // If the result indicates a non-retryable error, don't retry
                if (!IsRetryableError(result.ErrorMessage))
                {
                    logger.LogWarning(
                        "Non-retryable error encountered: {Error}", result.ErrorMessage);
                    result.AttemptCount = attempt + 1;
                    result.ElapsedTime = stopwatch.Elapsed;
                    return result;
                }

                attempt++;
            }
            catch (Exception ex) when (ShouldRetry(ex, attempt))
            {
                exceptions.Add(ex);
                logger.LogWarning(ex, "Slack notification attempt {Attempt} failed", attempt + 1);
                attempt++;
            }
            catch (Exception ex)
            {
                // Non-retryable exception
                logger.LogError(ex, "Non-retryable exception in Slack notification");
                return SlackNotificationResult.Failed(
                    ex.Message, attempt + 1, stopwatch.Elapsed);
            }
        }

        stopwatch.Stop();
        var aggregateException = new AggregateException(
            "All Slack notification retry attempts failed", exceptions);
        
        logger.LogError(aggregateException,
            "All {MaxAttempts} retry attempts failed after {ElapsedMs}ms",
            _settings.MaxRetryAttempts + 1, stopwatch.ElapsedMilliseconds);

        return SlackNotificationResult.Failed(
            $"Failed after {_settings.MaxRetryAttempts + 1} attempts: {aggregateException.Message}",
            _settings.MaxRetryAttempts + 1,
            stopwatch.Elapsed);
    }

    private TimeSpan CalculateDelay(int attempt)
    {
        // Exponential backoff with jitter
        var exponentialDelay = _settings.BaseRetryDelayMs * Math.Pow(2, attempt - 1);
        
        // Add jitter (random factor between 0.8 and 1.2)
        var jitter = new Random().NextDouble() * 0.4 + 0.8; // 0.8 to 1.2
        var delayMs = Math.Min(exponentialDelay * jitter, _settings.MaxRetryDelayMs);
        
        return TimeSpan.FromMilliseconds(delayMs);
    }

    private bool ShouldRetry(Exception exception, int attempt)
    {
        if (attempt >= _settings.MaxRetryAttempts)
        {
            return false;
        }

        return exception switch
        {
            HttpRequestException => true,
            TaskCanceledException => true,
            SocketException => true,
            TimeoutException => true,
            _ => false
        };
    }

    private bool IsRetryableError(string? errorMessage)
    {
        if (string.IsNullOrEmpty(errorMessage))
            return true;

        var lowerError = errorMessage.ToLower();
        
        // Slack-specific retryable errors
        var retryableErrors = new[]
        {
            "rate_limited",
            "internal_error", 
            "timeout",
            "service_unavailable",
            "network",
            "connection"
        };

        return retryableErrors.Any(error => lowerError.Contains(error));
    }
}