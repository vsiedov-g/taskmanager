using MediatR;

namespace TaskManager.Application.Boards.Commands;

public class JoinBoardByCodeCommand : IRequest<JoinBoardResult>
{
    public string JoinCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}

public class JoinBoardResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? BoardId { get; set; }
}