using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.ActivityLogs.Queries;

public class GetActivityLogByIdQuery : IRequest<ActivityLog?>
{
    public Guid Id { get; set; }

    public GetActivityLogByIdQuery(Guid id)
    {
        Id = id;
    }
}