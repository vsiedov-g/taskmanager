using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Interfaces;

public interface IActivityLogService
{
    // Card operations
    Task LogCardCreatedAsync(Card card, Guid userId);
    Task LogCardUpdatedAsync(Card oldCard, Card newCard, Guid userId);
    Task LogCardMovedAsync(Card card, string fromListName, string toListName, Guid userId);
    Task LogCardDeletedAsync(Card card, Guid userId);
    Task LogCardAssignedAsync(Card card, User? oldAssignee, User? newAssignee, Guid userId);
    Task LogCardPriorityChangedAsync(Card card, CardStatus oldPriority, CardStatus newPriority, Guid userId);
    
    // List operations
    Task LogListCreatedAsync(List list, Guid userId);
    Task LogListUpdatedAsync(List oldList, List newList, Guid userId);
    Task LogListDeletedAsync(List list, Guid userId);
    
    // Bulk operations
    Task LogBulkCardsDeletedAsync(List<Card> cards, Guid userId, string reason = "");
}