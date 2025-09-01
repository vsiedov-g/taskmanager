using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface IListRepository
{
    Task<IEnumerable<List>> GetAllAsync();
    Task<IEnumerable<List>> GetAllWithCardsAsync();
    Task<List?> GetByIdAsync(Guid id);
    Task<List?> GetByIdWithCardsAsync(Guid id);
    Task AddAsync(List list);
    void Update(List list);
    Task DeleteAsync(Guid id);
}