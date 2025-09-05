using MediatR;
using TaskManager.Application.ActivityLogs.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class GetActivityLogByIdQueryHandler : IRequestHandler<GetActivityLogByIdQuery, ActivityLog?>
{
    private readonly IActivityLogRepository _activityLogRepository;

    public GetActivityLogByIdQueryHandler(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task<ActivityLog?> Handle(GetActivityLogByIdQuery request, CancellationToken cancellationToken)
    {
        return await _activityLogRepository.GetByIdAsync(request.Id);
    }
}