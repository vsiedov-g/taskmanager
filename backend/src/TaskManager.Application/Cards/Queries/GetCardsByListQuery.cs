using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Cards.Queries;

public record GetCardsByListQuery(Guid ListId) : IRequest<IEnumerable<CardDto>>;