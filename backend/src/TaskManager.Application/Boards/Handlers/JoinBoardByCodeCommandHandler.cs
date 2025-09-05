using MediatR;
using TaskManager.Application.Boards.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Boards.Handlers;

public class JoinBoardByCodeCommandHandler : IRequestHandler<JoinBoardByCodeCommand, JoinBoardResult>
{
    private readonly IBoardRepository _boardRepository;
    private readonly IBoardMemberRepository _boardMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JoinBoardByCodeCommandHandler(
        IBoardRepository boardRepository,
        IBoardMemberRepository boardMemberRepository,
        IUnitOfWork unitOfWork)
    {
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<JoinBoardResult> Handle(JoinBoardByCodeCommand request, CancellationToken cancellationToken)
    {
        var board = await _boardRepository.GetByJoinCodeAsync(request.JoinCode);
        
        if (board == null)
        {
            return new JoinBoardResult
            {
                Success = false,
                Message = "Invalid join code"
            };
        }

        // Check if user is already a member
        var existingMember = await _boardMemberRepository.GetByBoardAndUserAsync(board.Id, request.UserId);

        if (existingMember != null)
        {
            return new JoinBoardResult
            {
                Success = false,
                Message = "You are already a member of this board",
                BoardId = board.Id
            };
        }

        // Add user as member
        var newMember = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = board.Id,
            UserId = request.UserId,
            Role = BoardRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        await _boardMemberRepository.AddAsync(newMember);
        await _unitOfWork.SaveChangesAsync();

        return new JoinBoardResult
        {
            Success = true,
            Message = "Successfully joined board",
            BoardId = board.Id
        };
    }
}