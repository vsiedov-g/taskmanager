using MediatR;
using TaskManager.Application.Cards.Queries;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Cards.Handlers;

public class GetCardByIdQueryHandler : IRequestHandler<GetCardByIdQuery, CardDto?>
{
    private readonly ICardRepository _cardRepository;

    public GetCardByIdQueryHandler(ICardRepository cardRepository)
    {
        _cardRepository = cardRepository;
    }

    public async Task<CardDto?> Handle(GetCardByIdQuery request, CancellationToken cancellationToken)
    {
        var card = await _cardRepository.GetByIdWithDetailsAsync(request.Id);
        
        if (card == null) return null;
        
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
            AssigneeName = card.Assignee != null ? $"{card.Assignee.FirstName} {card.Assignee.LastName}" : null,
            ListId = card.ListId,
            ListName = card.List?.Name ?? "",
            ProjectId = card.ProjectId,
            Assignee = card.Assignee != null ? new UserDto
            {
                Id = card.Assignee.Id,
                FirstName = card.Assignee.FirstName,
                LastName = card.Assignee.LastName,
                Email = card.Assignee.Email
            } : null
        };
    }
}