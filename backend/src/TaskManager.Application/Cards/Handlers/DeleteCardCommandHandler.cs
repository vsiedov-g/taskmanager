using MediatR;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Cards.Handlers;

public class DeleteCardCommandHandler : IRequestHandler<DeleteCardCommand, bool>
{
    private readonly ICardRepository _cardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCardCommandHandler(
        ICardRepository cardRepository,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        ICurrentUserService currentUserService)
    {
        _cardRepository = cardRepository;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteCardCommand request, CancellationToken cancellationToken)
    {
        var card = await _cardRepository.GetByIdAsync(request.Id);
        if (card == null) return false;

        // Log the activity before deletion
        var currentUserId = _currentUserService.GetCurrentUserId();
        await _activityLogService.LogCardDeletedAsync(card, currentUserId);

        await _cardRepository.DeleteAsync(request.Id);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}