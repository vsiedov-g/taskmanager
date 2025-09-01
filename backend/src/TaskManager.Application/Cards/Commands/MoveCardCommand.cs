using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Cards.Commands;

public record MoveCardCommand(Guid Id, Guid ListId, int Position) : IRequest<CardDto?>;