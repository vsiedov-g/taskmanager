using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface IBoardRepository
{
    Task<Board?> GetByIdAsync(Guid id);
    Task<Board?> GetByJoinCodeAsync(string joinCode);
    Task<List<Board>> GetUserBoardsAsync(Guid userId);
    Task<Board> AddAsync(Board board);
    Task<Board> UpdateAsync(Board board);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> IsJoinCodeUniqueAsync(string joinCode);
}