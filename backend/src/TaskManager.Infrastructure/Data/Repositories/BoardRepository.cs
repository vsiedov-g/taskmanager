using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Data.Repositories;

public class BoardRepository : IBoardRepository
{
    private readonly TaskManagerContext _context;

    public BoardRepository(TaskManagerContext context)
    {
        _context = context;
    }

    public async Task<Board?> GetByIdAsync(Guid id)
    {
        return await _context.Boards
            .Include(b => b.Owner)
            .Include(b => b.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Board?> GetByJoinCodeAsync(string joinCode)
    {
        return await _context.Boards
            .Include(b => b.Owner)
            .Include(b => b.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(b => b.JoinCode == joinCode);
    }

    public async Task<List<Board>> GetUserBoardsAsync(Guid userId)
    {
        return await _context.BoardMembers
            .Where(m => m.UserId == userId)
            .Include(m => m.Board)
                .ThenInclude(b => b.Members)
            .Select(m => m.Board)
            .ToListAsync();
    }

    public async Task<Board> AddAsync(Board board)
    {
        _context.Boards.Add(board);
        return board;
    }

    public async Task<Board> UpdateAsync(Board board)
    {
        _context.Boards.Update(board);
        return board;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var board = await _context.Boards.FindAsync(id);
        if (board == null) return false;

        _context.Boards.Remove(board);
        return true;
    }

    public async Task<bool> IsJoinCodeUniqueAsync(string joinCode)
    {
        return !await _context.Boards.AnyAsync(b => b.JoinCode == joinCode);
    }
}