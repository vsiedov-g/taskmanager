using TaskManager.Application.Common.Models;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Interfaces;

public interface ISlackNotifier
{
    Task<SlackNotificationResult> SendActivityNotificationAsync(
        ActivityLog activityLog, 
        CancellationToken cancellationToken = default);
        
    Task<SlackNotificationResult> SendActivityNotificationAsync(
        SlackNotificationData notificationData, 
        CancellationToken cancellationToken = default);
        
    Task<bool> IsConfiguredAsync();
    Task<bool> TestConnectionAsync();
}