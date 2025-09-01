using MediatR;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Commands;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Lists.Handlers;

public class UpdateListCommandHandler : IRequestHandler<UpdateListCommand, ListDto?>
{
    private readonly IListRepository _listRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUserService;

    public UpdateListCommandHandler(
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

    public async Task<ListDto?> Handle(UpdateListCommand request, CancellationToken cancellationToken)
    {
        var list = await _listRepository.GetByIdAsync(request.Id);
        if (list == null) return null;

        // Store original list state for activity logging
        var originalList = new List
        {
            Id = list.Id,
            Name = list.Name,
            Position = list.Position
        };

        list.Name = request.Title;
        list.Position = request.Position;

        _listRepository.Update(list);
        await _unitOfWork.SaveChangesAsync();

        // Log the activity
        var currentUserId = _currentUserService.GetCurrentUserId();
        await _activityLogService.LogListUpdatedAsync(originalList, list, currentUserId);
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