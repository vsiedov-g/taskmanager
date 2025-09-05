using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Data.Repositories;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly TaskManagerContext _context;

    public ActivityLogRepository(TaskManagerContext context)
    {
        _context = context;
    }

    public async Task<ActivityLog> AddAsync(ActivityLog activityLog)
    {
        await _context.ActivityLogs.AddAsync(activityLog);
        return activityLog;
    }

    public async Task<IEnumerable<ActivityLog>> GetByCardIdAsync(Guid cardId)
    {
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .Where(a => a.CardId == cardId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityLog>> GetByUserIdAsync(Guid userId)
    {
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityLog>> GetRecentAsync(int count = 20)
    {
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityLog>> GetPagedAsync(int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<ActivityLog?> GetByIdAsync(Guid id)
    {
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public void Update(ActivityLog activityLog)
    {
        _context.ActivityLogs.Update(activityLog);
    }

    public void Delete(ActivityLog activityLog)
    {
        _context.ActivityLogs.Remove(activityLog);
    }
}