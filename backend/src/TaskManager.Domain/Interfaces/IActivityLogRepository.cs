using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface IActivityLogRepository
{
    Task<ActivityLog> AddAsync(ActivityLog activityLog);
    Task<IEnumerable<ActivityLog>> GetByCardIdAsync(Guid cardId);
    Task<IEnumerable<ActivityLog>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<ActivityLog>> GetRecentAsync(int count = 20);
    Task<IEnumerable<ActivityLog>> GetPagedAsync(int page, int pageSize);
    Task<IEnumerable<ActivityLog>> GetByBoardIdAsync(Guid boardId, int page = 1, int pageSize = 50);
    Task<ActivityLog?> GetByIdAsync(Guid id);
    void Update(ActivityLog activityLog);
    void Delete(ActivityLog activityLog);
}