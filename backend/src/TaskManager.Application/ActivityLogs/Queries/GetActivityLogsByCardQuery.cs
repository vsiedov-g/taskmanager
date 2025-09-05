using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.ActivityLogs.Queries;

public class GetActivityLogsByCardQuery : IRequest<IEnumerable<ActivityLog>>
{
    public Guid CardId { get; set; }

    public GetActivityLogsByCardQuery(Guid cardId)
    {
        CardId = cardId;
    }
}