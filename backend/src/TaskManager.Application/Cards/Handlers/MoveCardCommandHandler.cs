using AutoMapper;
using MediatR;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Cards.Handlers;

public class MoveCardCommandHandler : IRequestHandler<MoveCardCommand, CardDto?>
{
    private readonly ICardRepository _cardRepository;
    private readonly IListRepository _listRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public MoveCardCommandHandler(
        ICardRepository cardRepository,
        IListRepository listRepository,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _cardRepository = cardRepository;
        _listRepository = listRepository;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<CardDto?> Handle(MoveCardCommand request, CancellationToken cancellationToken)
    {
        var card = await _cardRepository.GetByIdWithDetailsAsync(request.Id);
        if (card == null) return null;

        // Get the original and new list names for logging
        var originalList = await _listRepository.GetByIdAsync(card.ListId);
        var newList = await _listRepository.GetByIdAsync(request.ListId);

        if (originalList == null || newList == null) return null;

        var originalListName = originalList.Name;
        var newListName = newList.Name;

        card.ListId = request.ListId;
        card.Position = request.Position;

        _cardRepository.Update(card);
        await _unitOfWork.SaveChangesAsync();

        // Log the activity if the card actually moved to a different list
        if (originalList.Id != newList.Id)
        {
            var currentUserId = _currentUserService.GetCurrentUserId();
            await _activityLogService.LogCardMovedAsync(card, originalListName, newListName, currentUserId);
            await _unitOfWork.SaveChangesAsync();
        }

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
            AssigneeName = card.Assignee?.Name,
            ListId = card.ListId,
            ListName = newListName,
            ProjectId = card.ProjectId
        };
    }
}