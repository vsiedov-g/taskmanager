using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Boards.Queries;

public class GetUserBoardsQuery : IRequest<List<BoardDto>>
{
    public Guid UserId { get; set; }
}

public class BoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int MemberCount { get; set; }
    public BoardRole UserRole { get; set; }
}