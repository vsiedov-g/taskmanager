using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Data.Repositories;

public class BoardMemberRepository : IBoardMemberRepository
{
    private readonly TaskManagerContext _context;

    public BoardMemberRepository(TaskManagerContext context)
    {
        _context = context;
    }

    public async Task<BoardMember?> GetByIdAsync(Guid id)
    {
        return await _context.BoardMembers
            .Include(m => m.Board)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<BoardMember?> GetByBoardAndUserAsync(Guid boardId, Guid userId)
    {
        return await _context.BoardMembers
            .Include(m => m.Board)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.BoardId == boardId && m.UserId == userId);
    }

    public async Task<List<BoardMember>> GetByBoardAsync(Guid boardId)
    {
        return await _context.BoardMembers
            .Where(m => m.BoardId == boardId)
            .Include(m => m.User)
            .ToListAsync();
    }

    public async Task<List<BoardMember>> GetByUserAsync(Guid userId)
    {
        return await _context.BoardMembers
            .Where(m => m.UserId == userId)
            .Include(m => m.Board)
                .ThenInclude(b => b.Members)
            .ToListAsync();
    }

    public async Task<BoardMember> AddAsync(BoardMember boardMember)
    {
        _context.BoardMembers.Add(boardMember);
        return boardMember;
    }

    public async Task<BoardMember> UpdateAsync(BoardMember boardMember)
    {
        _context.BoardMembers.Update(boardMember);
        return boardMember;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var member = await _context.BoardMembers.FindAsync(id);
        if (member == null) return false;

        _context.BoardMembers.Remove(member);
        return true;
    }

    public async Task<bool> IsUserBoardMemberAsync(Guid boardId, Guid userId)
    {
        return await _context.BoardMembers
            .AnyAsync(m => m.BoardId == boardId && m.UserId == userId);
    }
}