using MediatR;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Commands;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Lists.Handlers;

public class CreateListCommandHandler : IRequestHandler<CreateListCommand, ListDto>
{
    private readonly IListRepository _listRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;

    public CreateListCommandHandler(
        IListRepository listRepository,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        ICurrentUserService currentUserService)
    {
        _listRepository = listRepository;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _currentUserService = currentUserService;
    }

    public async Task<ListDto> Handle(CreateListCommand request, CancellationToken cancellationToken)
    {
        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = request.Title,
            Position = request.Position,
            BoardId = request.BoardId
        };

        await _listRepository.AddAsync(list);
        await _unitOfWork.SaveChangesAsync();

        // Log the activity
        var currentUserId = _currentUserService.GetCurrentUserId();
        await _activityLogService.LogListCreatedAsync(list, currentUserId);
        await _unitOfWork.SaveChangesAsync();

        return new ListDto
        {
            Id = list.Id,
            Name = list.Name,
            Position = list.Position,
            Cards = new List<CardDto>()
        };
    }
}