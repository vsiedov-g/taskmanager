using MediatR;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Cards.Handlers;

public class UpdateCardCommandHandler : IRequestHandler<UpdateCardCommand, CardDto?>
{
    private readonly ICardRepository _cardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCardCommandHandler(
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

    public async Task<CardDto?> Handle(UpdateCardCommand request, CancellationToken cancellationToken)
    {
        var card = await _cardRepository.GetByIdWithDetailsAsync(request.Id);
        if (card == null) return null;

        // Store the original card state for activity logging
        var originalCard = new Card
        {
            Id = card.Id,
            Title = card.Title,
            Description = card.Description,
            Status = card.Status,
            Priority = card.Priority,
            DueDate = card.DueDate,
            Position = card.Position,
            AssigneeId = card.AssigneeId,
            ListId = card.ListId,
            ProjectId = card.ProjectId
        };

        card.Title = request.Title;
        card.Description = request.Description;
        card.Status = request.Status;
        card.Priority = request.Priority;
        card.DueDate = request.DueDate?.ToUniversalTime();
        card.Position = request.Position;
        card.AssigneeId = request.AssigneeId;
        card.ListId = request.ListId;
        card.ProjectId = request.ProjectId;
        card.UpdatedAt = DateTime.UtcNow;

        _cardRepository.Update(card);
        await _unitOfWork.SaveChangesAsync();

        // Log the activity
        var currentUserId = _currentUserService.GetCurrentUserId();
        await _activityLogService.LogCardUpdatedAsync(originalCard, card, currentUserId);
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