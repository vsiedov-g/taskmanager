using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Boards.Queries;

public class GetBoardDetailsQuery : IRequest<BoardDetailsDto?>
{
    public Guid BoardId { get; set; }
    public Guid UserId { get; set; }
}

public class BoardDetailsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public BoardRole UserRole { get; set; }
    public List<BoardMemberDto> Members { get; set; } = new List<BoardMemberDto>();
}

public class BoardMemberDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public BoardRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
}