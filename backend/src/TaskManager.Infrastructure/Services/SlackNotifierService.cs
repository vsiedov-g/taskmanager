using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.Common.Models;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Models;

namespace TaskManager.Infrastructure.Services;

public class SlackNotifierService : ISlackNotifier
{
    private readonly HttpClient _httpClient;
    private readonly ISlackMessageBuilder _messageBuilder;
    private readonly ISlackRetryPolicy _retryPolicy;
    private readonly SlackSettings _settings;
    private readonly ILogger<SlackNotifierService> _logger;

    public SlackNotifierService(
        HttpClient httpClient,
        ISlackMessageBuilder messageBuilder,
        ISlackRetryPolicy retryPolicy,
        IOptions<SlackSettings> settings,
        ILogger<SlackNotifierService> logger)
    {
        _httpClient = httpClient;
        _messageBuilder = messageBuilder;
        _retryPolicy = retryPolicy;
        _settings = settings.Value;
        _logger = logger;
        
        // Configure HttpClient timeout
        _httpClient.Timeout = TimeSpan.FromSeconds(_settings.RequestTimeoutSeconds);
    }

    public async Task<SlackNotificationResult> SendActivityNotificationAsync(
        ActivityLog activityLog, 
        CancellationToken cancellationToken = default)
    {
        if (!_settings.EnableNotifications || !await IsConfiguredAsync())
        {
            _logger.LogInformation("Slack notifications disabled or not configured");
            return SlackNotificationResult.Skipped("Not configured");
        }

        var correlationId = Guid.NewGuid().ToString();
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["ActivityLogId"] = activityLog.Id,
            ["UserId"] = activityLog.UserId,
            ["Action"] = activityLog.Action,
            ["EntityType"] = activityLog.EntityType
        });

        _logger.LogInformation("Starting Slack notification for activity {ActivityLogId}", activityLog.Id);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var result = await _retryPolicy.ExecuteAsync(
                async () => await SendNotificationInternal(activityLog, cancellationToken),
                _logger,
                cancellationToken);

            stopwatch.Stop();

            if (result.IsSuccess)
            {
                _logger.LogInformation(
                    "Slack notification sent successfully in {ElapsedMs}ms after {AttemptCount} attempts. MessageTs: {MessageTs}",
                    stopwatch.ElapsedMilliseconds, result.AttemptCount, result.MessageTs);
            }
            else
            {
                _logger.LogWarning(
                    "Slack notification failed after {ElapsedMs}ms and {AttemptCount} attempts: {Error}",
                    stopwatch.ElapsedMilliseconds, result.AttemptCount, result.ErrorMessage);
            }

            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, 
                "Failed to send Slack notification after {ElapsedMs}ms and {MaxAttempts} attempts",
                stopwatch.ElapsedMilliseconds, _settings.MaxRetryAttempts);

            return SlackNotificationResult.Failed(ex.Message, _settings.MaxRetryAttempts, stopwatch.Elapsed);
        }
    }

    public async Task<SlackNotificationResult> SendActivityNotificationAsync(
        SlackNotificationData notificationData, 
        CancellationToken cancellationToken = default)
    {
        if (!_settings.EnableNotifications || !await IsConfiguredAsync())
        {
            _logger.LogInformation("Slack notifications disabled or not configured");
            return SlackNotificationResult.Skipped("Not configured");
        }

        var correlationId = Guid.NewGuid().ToString();
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["ActivityLogId"] = notificationData.ActivityLog.Id,
            ["UserId"] = notificationData.ActivityLog.UserId,
            ["Action"] = notificationData.ActivityLog.Action,
            ["EntityType"] = notificationData.ActivityLog.EntityType
        });

        _logger.LogInformation("Starting Slack notification for activity {ActivityLogId}", notificationData.ActivityLog.Id);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var result = await _retryPolicy.ExecuteAsync(
                async () => await SendNotificationInternal(notificationData, cancellationToken),
                _logger,
                cancellationToken);

            stopwatch.Stop();

            if (result.IsSuccess)
            {
                _logger.LogInformation(
                    "Slack notification sent successfully in {ElapsedMs}ms after {AttemptCount} attempts. MessageTs: {MessageTs}",
                    stopwatch.ElapsedMilliseconds, result.AttemptCount, result.MessageTs);
            }
            else
            {
                _logger.LogWarning(
                    "Slack notification failed after {ElapsedMs}ms and {AttemptCount} attempts: {Error}",
                    stopwatch.ElapsedMilliseconds, result.AttemptCount, result.ErrorMessage);
            }

            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, 
                "Failed to send Slack notification after {ElapsedMs}ms and {MaxAttempts} attempts",
                stopwatch.ElapsedMilliseconds, _settings.MaxRetryAttempts);

            return SlackNotificationResult.Failed(ex.Message, _settings.MaxRetryAttempts, stopwatch.Elapsed);
        }
    }

    private async Task<SlackNotificationResult> SendNotificationInternal(
        ActivityLog activityLog, 
        CancellationToken cancellationToken)
    {
        var message = await _messageBuilder.BuildActivityMessageAsync(activityLog);
        
        _logger.LogDebug("Sending Slack webhook message: {MessageText}", message.Text);

        try
        {
            var payload = CreateWebhookPayload(message);
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_settings.WebhookUrl, content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                var errorMessage = $"Slack webhook error: {response.StatusCode} - {responseContent}";
                throw new HttpRequestException(errorMessage);
            }

            _logger.LogDebug("Slack webhook response successful. Status: {StatusCode}", response.StatusCode);
            return SlackNotificationResult.Success(DateTime.UtcNow.ToString("yyyy-MM-dd_HH:mm:ss"), 1, TimeSpan.Zero);
        }
        catch (HttpRequestException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new HttpRequestException($"Slack webhook notification failed: {ex.Message}", ex);
        }
    }

    private async Task<SlackNotificationResult> SendNotificationInternal(
        SlackNotificationData notificationData, 
        CancellationToken cancellationToken)
    {
        var message = await _messageBuilder.BuildActivityMessage(notificationData);
        
        _logger.LogDebug("Sending Slack webhook message: {MessageText}", message.Text);

        try
        {
            var payload = CreateWebhookPayload(message);
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_settings.WebhookUrl, content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                var errorMessage = $"Slack webhook error: {response.StatusCode} - {responseContent}";
                throw new HttpRequestException(errorMessage);
            }

            _logger.LogDebug("Slack webhook response successful. Status: {StatusCode}", response.StatusCode);
            return SlackNotificationResult.Success(DateTime.UtcNow.ToString("yyyy-MM-dd_HH:mm:ss"), 1, TimeSpan.Zero);
        }
        catch (HttpRequestException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new HttpRequestException($"Slack webhook notification failed: {ex.Message}", ex);
        }
    }

    public Task<bool> IsConfiguredAsync()
    {
        var isConfigured = !string.IsNullOrEmpty(_settings.WebhookUrl) && 
                          Uri.IsWellFormedUriString(_settings.WebhookUrl, UriKind.Absolute) &&
                          _settings.WebhookUrl.Contains("hooks.slack.com");
        
        if (!isConfigured)
        {
            _logger.LogDebug("Slack not configured: WebhookUrl={HasWebhookUrl}", 
                !string.IsNullOrEmpty(_settings.WebhookUrl));
        }
        
        return Task.FromResult(isConfigured);
    }

    public async Task<bool> TestConnectionAsync()
    {
        try
        {
            if (!await IsConfiguredAsync())
            {
                _logger.LogWarning("Slack connection test failed: Not configured");
                return false;
            }

            // Send a test message to verify webhook connectivity
            var testPayload = new { text = "Test connection from Task Manager" };
            var json = JsonSerializer.Serialize(testPayload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_settings.WebhookUrl, content);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Slack webhook connection test successful");
                return true;
            }
            else
            {
                _logger.LogWarning("Slack webhook connection test failed: {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Slack webhook connection test failed with exception");
            return false;
        }
    }

    private object CreateWebhookPayload(SlackMessage message)
    {
        var payload = new Dictionary<string, object>
        {
            ["text"] = message.Text
        };

        if (!string.IsNullOrEmpty(message.Channel) && !string.IsNullOrEmpty(_settings.Channel))
        {
            payload["channel"] = _settings.Channel;
        }

        if (message.Blocks != null && message.Blocks.Length > 0)
        {
            payload["blocks"] = message.Blocks;
        }

        return payload;
    }
}