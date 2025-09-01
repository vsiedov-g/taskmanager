using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Cards.Queries;

public record GetCardsQuery : IRequest<IEnumerable<CardDto>>;