using MediatR;
using TaskManager.Application.Boards.Queries;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Boards.Handlers;

public class GetBoardDetailsQueryHandler : IRequestHandler<GetBoardDetailsQuery, BoardDetailsDto?>
{
    private readonly IBoardRepository _boardRepository;
    private readonly IBoardMemberRepository _boardMemberRepository;

    public GetBoardDetailsQueryHandler(IBoardRepository boardRepository, IBoardMemberRepository boardMemberRepository)
    {
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
    }

    public async Task<BoardDetailsDto?> Handle(GetBoardDetailsQuery request, CancellationToken cancellationToken)
    {
        var userMembership = await _boardMemberRepository.GetByBoardAndUserAsync(request.BoardId, request.UserId);

        if (userMembership == null)
        {
            return null; // User is not a member of this board
        }

        var board = await _boardRepository.GetByIdAsync(request.BoardId);

        if (board == null)
        {
            return null;
        }

        return new BoardDetailsDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            JoinCode = board.JoinCode,
            OwnerId = board.OwnerId,
            CreatedAt = board.CreatedAt,
            UserRole = userMembership.Role,
            Members = board.Members.Select(m => new BoardMemberDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserName = m.User.Name,
                Role = m.Role,
                JoinedAt = m.JoinedAt
            }).ToList()
        };
    }
}