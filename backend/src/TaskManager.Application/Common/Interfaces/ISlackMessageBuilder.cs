using TaskManager.Application.Common.Models;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Interfaces;

public interface ISlackMessageBuilder
{
    Task<SlackMessage> BuildActivityMessageAsync(ActivityLog activityLog);
    Task<SlackMessage> BuildActivityMessage(SlackNotificationData notificationData);
}