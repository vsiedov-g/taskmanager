using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface ICardRepository
{
    Task<IEnumerable<Card>> GetAllAsync();
    Task<Card?> GetByIdAsync(Guid id);
    Task<Card?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<Card>> GetByListIdAsync(Guid listId);
    Task AddAsync(Card card);
    void Update(Card card);
    Task DeleteAsync(Guid id);
}