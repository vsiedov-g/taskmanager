using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Models;

public class SlackNotificationData
{
    public ActivityLog ActivityLog { get; set; } = null!;
    public string UserName { get; set; } = string.Empty;
    public string? CardTitle { get; set; }
    public string? CardDescription { get; set; }
    public CardPriority? CardPriority { get; set; }
    public CardStatus? CardStatus { get; set; }
    public DateTime? CardDueDate { get; set; }
    public string? ListTitle { get; set; }
    public string? AssigneeName { get; set; }
}