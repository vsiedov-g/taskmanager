using AutoMapper;
using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Commands;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Lists.Handlers;

public class ReorderListsCommandHandler : IRequestHandler<ReorderListsCommand, IEnumerable<ListDto>>
{
    private readonly IListRepository _listRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ReorderListsCommandHandler(
        IListRepository listRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _listRepository = listRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ListDto>> Handle(ReorderListsCommand request, CancellationToken cancellationToken)
    {
        var listIds = request.ListIds.ToList();
        var lists = new List<TaskManager.Domain.Entities.List>();

        // Get all lists to reorder
        foreach (var listId in listIds)
        {
            var list = await _listRepository.GetByIdAsync(listId);
            if (list != null)
            {
                lists.Add(list);
            }
        }

        // Update positions based on the new order
        for (int i = 0; i < lists.Count; i++)
        {
            lists[i].Position = i;
            _listRepository.Update(lists[i]);
        }

        await _unitOfWork.SaveChangesAsync();

        // Return all lists ordered by position
        var allLists = await _listRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<ListDto>>(allLists.OrderBy(l => l.Position));
    }
}