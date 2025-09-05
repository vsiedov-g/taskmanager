using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.ActivityLogs.Queries;

public class GetActivityLogsQuery : IRequest<IEnumerable<ActivityLog>>
{
    public Guid? BoardId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}