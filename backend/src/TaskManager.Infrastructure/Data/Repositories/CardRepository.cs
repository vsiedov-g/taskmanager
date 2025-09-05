using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Data.Repositories;

public class CardRepository : ICardRepository
{
    private readonly TaskManagerContext _context;

    public CardRepository(TaskManagerContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Card>> GetAllAsync()
    {
        return await _context.Cards
            .Include(c => c.Assignee)
            .Include(c => c.List)
            .OrderBy(c => c.Position)
            .ToListAsync();
    }

    public async Task<Card?> GetByIdAsync(Guid id)
    {
        return await _context.Cards.FindAsync(id);
    }

    public async Task<Card?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Cards
            .Include(c => c.Assignee)
            .Include(c => c.List)
            .Include(c => c.ActivityLogs)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Card>> GetByListIdAsync(Guid listId)
    {
        return await _context.Cards
            .Include(c => c.Assignee)
            .Include(c => c.List)
            .Where(c => c.ListId == listId)
            .OrderBy(c => c.Position)
            .ToListAsync();
    }

    public async Task AddAsync(Card card)
    {
        await _context.Cards.AddAsync(card);
    }

    public void Update(Card card)
    {
        _context.Cards.Update(card);
    }

    public async Task DeleteAsync(Guid id)
    {
        var card = await _context.Cards.FindAsync(id);
        if (card != null)
        {
            _context.Cards.Remove(card);
        }
    }
}