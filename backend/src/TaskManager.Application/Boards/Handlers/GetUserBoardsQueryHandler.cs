using MediatR;
using TaskManager.Application.Boards.Queries;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Boards.Handlers;

public class GetUserBoardsQueryHandler : IRequestHandler<GetUserBoardsQuery, List<BoardDto>>
{
    private readonly IBoardMemberRepository _boardMemberRepository;

    public GetUserBoardsQueryHandler(IBoardMemberRepository boardMemberRepository)
    {
        _boardMemberRepository = boardMemberRepository;
    }

    public async Task<List<BoardDto>> Handle(GetUserBoardsQuery request, CancellationToken cancellationToken)
    {
        var userMemberships = await _boardMemberRepository.GetByUserAsync(request.UserId);
        
        var boards = userMemberships.Select(m => new BoardDto
        {
            Id = m.Board.Id,
            Name = m.Board.Name,
            Description = m.Board.Description,
            JoinCode = m.Board.JoinCode,
            OwnerId = m.Board.OwnerId,
            CreatedAt = m.Board.CreatedAt,
            MemberCount = m.Board.Members.Count,
            UserRole = m.Role
        }).ToList();

        return boards;
    }
}