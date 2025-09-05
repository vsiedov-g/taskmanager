using MediatR;
using TaskManager.Application.ActivityLogs.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class GetActivityLogsQueryHandler : IRequestHandler<GetActivityLogsQuery, IEnumerable<ActivityLog>>
{
    private readonly IActivityLogRepository _activityLogRepository;

    public GetActivityLogsQueryHandler(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task<IEnumerable<ActivityLog>> Handle(GetActivityLogsQuery request, CancellationToken cancellationToken)
    {
        if (request.BoardId.HasValue)
        {
            return await _activityLogRepository.GetByBoardIdAsync(request.BoardId.Value, request.Page, request.PageSize);
        }

        return await _activityLogRepository.GetPagedAsync(request.Page, request.PageSize);
    }
}