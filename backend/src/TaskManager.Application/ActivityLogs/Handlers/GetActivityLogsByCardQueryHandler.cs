using MediatR;
using TaskManager.Application.ActivityLogs.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class GetActivityLogsByCardQueryHandler : IRequestHandler<GetActivityLogsByCardQuery, IEnumerable<ActivityLog>>
{
    private readonly IActivityLogRepository _activityLogRepository;

    public GetActivityLogsByCardQueryHandler(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task<IEnumerable<ActivityLog>> Handle(GetActivityLogsByCardQuery request, CancellationToken cancellationToken)
    {
        return await _activityLogRepository.GetByCardIdAsync(request.CardId);
    }
}