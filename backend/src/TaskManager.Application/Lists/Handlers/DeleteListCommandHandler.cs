using MediatR;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.Lists.Commands;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Lists.Handlers;

public class DeleteListCommandHandler : IRequestHandler<DeleteListCommand, bool>
{
    private readonly IListRepository _listRepository;
    private readonly ICardRepository _cardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;

    public DeleteListCommandHandler(
        IListRepository listRepository,
        ICardRepository cardRepository,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        ICurrentUserService currentUserService)
    {
        _listRepository = listRepository;
        _cardRepository = cardRepository;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteListCommand request, CancellationToken cancellationToken)
    {
        var list = await _listRepository.GetByIdAsync(request.Id);
        if (list == null) return false;

        var currentUserId = _currentUserService.GetCurrentUserId();

        // Get all cards in this list before deletion
        var cardsInList = await _cardRepository.GetByListIdAsync(request.Id);
        
        // Log bulk card deletions if any cards exist
        if (cardsInList.Any())
        {
            await _activityLogService.LogBulkCardsDeletedAsync(
                cardsInList.ToList(), 
                currentUserId, 
                $"list \"{list.Name}\" was deleted"
            );
        }

        // Log list deletion
        await _activityLogService.LogListDeletedAsync(list, currentUserId);

        // Delete the list (cards should cascade delete if properly configured)
        await _listRepository.DeleteAsync(request.Id);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}