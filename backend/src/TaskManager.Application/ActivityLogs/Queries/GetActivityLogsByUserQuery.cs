using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.ActivityLogs.Queries;

public class GetActivityLogsByUserQuery : IRequest<IEnumerable<ActivityLog>>
{
    public Guid UserId { get; set; }

    public GetActivityLogsByUserQuery(Guid userId)
    {
        UserId = userId;
    }
}