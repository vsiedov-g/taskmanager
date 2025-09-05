using MediatR;
using TaskManager.Application.ActivityLogs.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class GetActivityLogsByUserQueryHandler : IRequestHandler<GetActivityLogsByUserQuery, IEnumerable<ActivityLog>>
{
    private readonly IActivityLogRepository _activityLogRepository;

    public GetActivityLogsByUserQueryHandler(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task<IEnumerable<ActivityLog>> Handle(GetActivityLogsByUserQuery request, CancellationToken cancellationToken)
    {
        return await _activityLogRepository.GetByUserIdAsync(request.UserId);
    }
}