using MediatR;
using TaskManager.Application.ActivityLogs.Commands;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class UpdateActivityLogCommandHandler : IRequestHandler<UpdateActivityLogCommand, ActivityLog?>
{
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateActivityLogCommandHandler(IActivityLogRepository activityLogRepository, IUnitOfWork unitOfWork)
    {
        _activityLogRepository = activityLogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ActivityLog?> Handle(UpdateActivityLogCommand request, CancellationToken cancellationToken)
    {
        var existingLog = await _activityLogRepository.GetByIdAsync(request.Id);
        if (existingLog == null)
        {
            return null;
        }

        existingLog.Action = request.Action;
        existingLog.EntityType = request.EntityType;
        existingLog.EntityId = request.EntityId;
        existingLog.Description = request.Description;
        existingLog.UserId = request.UserId;
        existingLog.CardId = request.CardId;

        _activityLogRepository.Update(existingLog);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return existingLog;
    }
}