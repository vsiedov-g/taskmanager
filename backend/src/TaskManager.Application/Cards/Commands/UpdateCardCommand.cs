using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Cards.Commands;

public record UpdateCardCommand(
    Guid Id,
    string Title, 
    string Description, 
    CardStatus Status,
    CardPriority Priority,
    DateTime? DueDate,
    int Position, 
    Guid? AssigneeId, 
    Guid ListId,
    Guid? ProjectId) : IRequest<CardDto?>;