using MediatR;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Cards.Handlers;

public class CreateCardCommandHandler : IRequestHandler<CreateCardCommand, CardDto>
{
    private readonly ICardRepository _cardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;

    public CreateCardCommandHandler(
        ICardRepository cardRepository,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        ICurrentUserService currentUserService)
    {
        _cardRepository = cardRepository;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _currentUserService = currentUserService;
    }

    public async Task<CardDto> Handle(CreateCardCommand request, CancellationToken cancellationToken)
    {
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate?.ToUniversalTime(),
            Position = request.Position,
            AssigneeId = request.AssigneeId,
            ListId = request.ListId,
            ProjectId = request.ProjectId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _cardRepository.AddAsync(card);
        await _unitOfWork.SaveChangesAsync();

        // Log the activity
        var currentUserId = _currentUserService.GetCurrentUserId();
        await _activityLogService.LogCardCreatedAsync(card, currentUserId);
        await _unitOfWork.SaveChangesAsync();

        return new CardDto
        {
            Id = card.Id,
            Title = card.Title,
            Description = card.Description,
            Status = card.Status,
            Priority = card.Priority,
            DueDate = card.DueDate,
            Position = card.Position,
            CreatedAt = card.CreatedAt,
            UpdatedAt = card.UpdatedAt,
            AssigneeId = card.AssigneeId,
            AssigneeName = card.Assignee?.FirstName + " " + card.Assignee?.LastName,
            ListId = card.ListId,
            ProjectId = card.ProjectId
        };
    }
}