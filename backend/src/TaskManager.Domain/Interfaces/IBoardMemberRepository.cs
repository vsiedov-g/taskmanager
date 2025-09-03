using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface IBoardMemberRepository
{
    Task<BoardMember?> GetByIdAsync(Guid id);
    Task<BoardMember?> GetByBoardAndUserAsync(Guid boardId, Guid userId);
    Task<List<BoardMember>> GetByBoardAsync(Guid boardId);
    Task<List<BoardMember>> GetByUserAsync(Guid userId);
    Task<BoardMember> AddAsync(BoardMember boardMember);
    Task<BoardMember> UpdateAsync(BoardMember boardMember);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> IsUserBoardMemberAsync(Guid boardId, Guid userId);
}