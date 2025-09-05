namespace TaskManager.Infrastructure.Models;

public class SlackSettings
{
    public string WebhookUrl { get; set; } = string.Empty;
    public string Channel { get; set; } = "#general";
    public string BaseUrl { get; set; } = string.Empty;
    public string ClientBaseUrl { get; set; } = string.Empty;
    public bool EnableNotifications { get; set; } = true;
    public bool EnableRetries { get; set; } = true;
    public int MaxRetryAttempts { get; set; } = 3;
    public int BaseRetryDelayMs { get; set; } = 1000;
    public int MaxRetryDelayMs { get; set; } = 30000;
    public int RequestTimeoutSeconds { get; set; } = 30;
}