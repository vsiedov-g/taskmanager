using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Cards.Queries;

public record GetCardByIdQuery(Guid Id) : IRequest<CardDto?>;