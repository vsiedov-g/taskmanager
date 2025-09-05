using MediatR;
using TaskManager.Application.ActivityLogs.Commands;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class CreateActivityLogCommandHandler : IRequestHandler<CreateActivityLogCommand, ActivityLog>
{
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateActivityLogCommandHandler(IActivityLogRepository activityLogRepository, IUnitOfWork unitOfWork)
    {
        _activityLogRepository = activityLogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ActivityLog> Handle(CreateActivityLogCommand request, CancellationToken cancellationToken)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            UserId = request.UserId,
            CardId = request.CardId,
            CreatedAt = DateTime.UtcNow
        };

        var createdLog = await _activityLogRepository.AddAsync(activityLog);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return createdLog;
    }
}