using MediatR;
using TaskManager.Application.ActivityLogs.Commands;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.ActivityLogs.Handlers;

public class DeleteActivityLogCommandHandler : IRequestHandler<DeleteActivityLogCommand, bool>
{
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteActivityLogCommandHandler(IActivityLogRepository activityLogRepository, IUnitOfWork unitOfWork)
    {
        _activityLogRepository = activityLogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteActivityLogCommand request, CancellationToken cancellationToken)
    {
        var existingLog = await _activityLogRepository.GetByIdAsync(request.Id);
        if (existingLog == null)
        {
            return false;
        }

        _activityLogRepository.Delete(existingLog);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}