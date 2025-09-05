using MediatR;

namespace TaskManager.Application.Cards.Commands;

public record DeleteCardCommand(Guid Id) : IRequest<bool>;