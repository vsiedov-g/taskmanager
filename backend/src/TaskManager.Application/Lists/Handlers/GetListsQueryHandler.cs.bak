using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Queries;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Lists.Handlers;

public class GetListsQueryHandler : IRequestHandler<GetListsQuery, IEnumerable<ListDto>>
{
    private readonly IListRepository _listRepository;

    public GetListsQueryHandler(IListRepository listRepository)
    {
        _listRepository = listRepository;
    }

    public async Task<IEnumerable<ListDto>> Handle(GetListsQuery request, CancellationToken cancellationToken)
    {
        var lists = await _listRepository.GetAllWithCardsAsync();
        
        return lists.Select(list => new ListDto
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
        });
    }
}