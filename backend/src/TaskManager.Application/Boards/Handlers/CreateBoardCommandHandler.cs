using MediatR;
using TaskManager.Application.Boards.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Boards.Handlers;

public class CreateBoardCommandHandler : IRequestHandler<CreateBoardCommand, CreateBoardResult>
{
    private readonly IBoardRepository _boardRepository;
    private readonly IBoardMemberRepository _boardMemberRepository;
    private readonly IJoinCodeService _joinCodeService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBoardCommandHandler(
        IBoardRepository boardRepository,
        IBoardMemberRepository boardMemberRepository,
        IJoinCodeService joinCodeService,
        IUnitOfWork unitOfWork)
    {
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
        _joinCodeService = joinCodeService;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateBoardResult> Handle(CreateBoardCommand request, CancellationToken cancellationToken)
    {
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            JoinCode = _joinCodeService.GenerateUniqueCode(),
            OwnerId = request.UserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _boardRepository.AddAsync(board);

        // Add owner as admin member
        var ownerMember = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = board.Id,
            UserId = request.UserId,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        await _boardMemberRepository.AddAsync(ownerMember);
        await _unitOfWork.SaveChangesAsync();

        return new CreateBoardResult
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            JoinCode = board.JoinCode,
            CreatedAt = board.CreatedAt
        };
    }
}