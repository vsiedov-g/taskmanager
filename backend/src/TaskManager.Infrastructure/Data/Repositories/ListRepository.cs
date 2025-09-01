using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Data.Repositories;

public class ListRepository : IListRepository
{
    private readonly TaskManagerContext _context;

    public ListRepository(TaskManagerContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<List>> GetAllAsync()
    {
        return await _context.Lists
            .OrderBy(l => l.Position)
            .ToListAsync();
    }

    public async Task<IEnumerable<List>> GetAllWithCardsAsync()
    {
        return await _context.Lists
            .Include(l => l.Cards)
                .ThenInclude(c => c.Assignee)
            .OrderBy(l => l.Position)
            .ToListAsync();
    }

    public async Task<List?> GetByIdAsync(Guid id)
    {
        return await _context.Lists.FindAsync(id);
    }

    public async Task<List?> GetByIdWithCardsAsync(Guid id)
    {
        return await _context.Lists
            .Include(l => l.Cards)
                .ThenInclude(c => c.Assignee)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task AddAsync(List list)
    {
        await _context.Lists.AddAsync(list);
    }

    public void Update(List list)
    {
        _context.Lists.Update(list);
    }

    public async Task DeleteAsync(Guid id)
    {
        var list = await _context.Lists.FindAsync(id);
        if (list != null)
        {
            _context.Lists.Remove(list);
        }
    }
}