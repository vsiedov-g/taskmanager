using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.ActivityLogs.Commands;

public class UpdateActivityLogCommand : IRequest<ActivityLog?>
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public Guid? CardId { get; set; }
}