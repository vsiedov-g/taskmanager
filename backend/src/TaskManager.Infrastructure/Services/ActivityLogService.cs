using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly IListRepository _listRepository;

    public ActivityLogService(
        IActivityLogRepository activityLogRepository,
        IListRepository listRepository)
    {
        _activityLogRepository = activityLogRepository;
        _listRepository = listRepository;
    }

    public async Task LogCardCreatedAsync(Card card, Guid userId)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "Card",
            EntityId = card.Id,
            Description = $"created card \"{card.Title}\"",
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = card.Id
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogCardUpdatedAsync(Card oldCard, Card newCard, Guid userId)
    {
        var changes = new List<string>();

        if (oldCard.Title != newCard.Title)
        {
            changes.Add($"title from \"{oldCard.Title}\" to \"{newCard.Title}\"");
        }

        if (oldCard.Description != newCard.Description)
        {
            changes.Add("description");
        }

        if (oldCard.Status != newCard.Status)
        {
            changes.Add($"status from {oldCard.Status} to {newCard.Status}");
        }

        if (oldCard.AssigneeId != newCard.AssigneeId)
        {
            var assigneeChange = newCard.AssigneeId.HasValue 
                ? $"assigned to user {newCard.AssigneeId}" 
                : "unassigned";
            changes.Add(assigneeChange);
        }

        if (changes.Any())
        {
            var description = $"updated card \"{newCard.Title}\" - changed {string.Join(", ", changes)}";
            
            var activityLog = new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "UPDATE",
                EntityType = "Card",
                EntityId = newCard.Id,
                Description = description,
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                CardId = newCard.Id
            };

            await _activityLogRepository.AddAsync(activityLog);
        }
    }

    public async Task LogCardMovedAsync(Card card, string fromListName, string toListName, Guid userId)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "MOVE",
            EntityType = "Card",
            EntityId = card.Id,
            Description = $"moved card \"{card.Title}\" from \"{fromListName}\" to \"{toListName}\"",
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = card.Id
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogCardDeletedAsync(Card card, Guid userId)
    {
        var list = await _listRepository.GetByIdAsync(card.ListId);
        var listName = list?.Name ?? "Unknown List";

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "DELETE",
            EntityType = "Card",
            EntityId = card.Id,
            Description = $"deleted card \"{card.Title}\" from \"{listName}\"",
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = card.Id
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogCardAssignedAsync(Card card, User? oldAssignee, User? newAssignee, Guid userId)
    {
        string description;
        
        if (newAssignee != null && oldAssignee != null)
        {
            description = $"reassigned card \"{card.Title}\" from {oldAssignee.FirstName} {oldAssignee.LastName} to {newAssignee.FirstName} {newAssignee.LastName}";
        }
        else if (newAssignee != null)
        {
            description = $"assigned card \"{card.Title}\" to {newAssignee.FirstName} {newAssignee.LastName}";
        }
        else
        {
            description = $"unassigned card \"{card.Title}\"";
        }

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "ASSIGN",
            EntityType = "Card",
            EntityId = card.Id,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = card.Id
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogCardPriorityChangedAsync(Card card, CardStatus oldPriority, CardStatus newPriority, Guid userId)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "PRIORITY_CHANGE",
            EntityType = "Card",
            EntityId = card.Id,
            Description = $"changed priority of card \"{card.Title}\" from {oldPriority} to {newPriority}",
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = card.Id
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogListCreatedAsync(List list, Guid userId)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "List",
            EntityId = list.Id,
            Description = $"created list \"{list.Name}\"",
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = null
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogListUpdatedAsync(List oldList, List newList, Guid userId)
    {
        var changes = new List<string>();

        if (oldList.Name != newList.Name)
        {
            changes.Add($"name from \"{oldList.Name}\" to \"{newList.Name}\"");
        }

        if (oldList.Position != newList.Position)
        {
            changes.Add($"position from {oldList.Position} to {newList.Position}");
        }

        if (changes.Any())
        {
            var description = $"updated list \"{newList.Name}\" - changed {string.Join(", ", changes)}";
            
            var activityLog = new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "UPDATE",
                EntityType = "List",
                EntityId = newList.Id,
                Description = description,
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                CardId = null
            };

            await _activityLogRepository.AddAsync(activityLog);
        }
    }

    public async Task LogListDeletedAsync(List list, Guid userId)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "DELETE",
            EntityType = "List",
            EntityId = list.Id,
            Description = $"deleted list \"{list.Name}\"",
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            CardId = null
        };

        await _activityLogRepository.AddAsync(activityLog);
    }

    public async Task LogBulkCardsDeletedAsync(List<Card> cards, Guid userId, string reason = "")
    {
        if (!cards.Any()) return;

        foreach (var card in cards)
        {
            var description = string.IsNullOrEmpty(reason) 
                ? $"deleted card \"{card.Title}\"" 
                : $"deleted card \"{card.Title}\" ({reason})";

            var activityLog = new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "DELETE",
                EntityType = "Card",
                EntityId = card.Id,
                Description = description,
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                CardId = card.Id
            };

            await _activityLogRepository.AddAsync(activityLog);
        }
    }
}