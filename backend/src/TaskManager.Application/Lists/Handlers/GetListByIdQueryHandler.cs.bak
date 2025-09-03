using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Queries;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Lists.Handlers;

public class GetListByIdQueryHandler : IRequestHandler<GetListByIdQuery, ListDto?>
{
    private readonly IListRepository _listRepository;

    public GetListByIdQueryHandler(IListRepository listRepository)
    {
        _listRepository = listRepository;
    }

    public async Task<ListDto?> Handle(GetListByIdQuery request, CancellationToken cancellationToken)
    {
        var list = await _listRepository.GetByIdWithCardsAsync(request.Id);
        
        if (list == null) return null;
        
        return new ListDto
        {
            Id = list.Id,
            Name = list.Name,
            Position = list.Position,
            Cards = list.Cards.Select(card => new CardDto
            {
                Id = card.Id,
                Title = card.Title,
                Description = card.Description,
                Status = card.Status,
                Position = card.Position,
                AssigneeId = card.AssigneeId,
                ListId = card.ListId,
                Assignee = card.Assignee != null ? new UserDto
                {
                    Id = card.Assignee.Id,
                    FirstName = card.Assignee.FirstName,
                    LastName = card.Assignee.LastName,
                    Email = card.Assignee.Email
                } : null
            }).ToList()
        };
    }
}