using MediatR;

namespace TaskManager.Application.Lists.Commands;

public record DeleteListCommand(Guid Id) : IRequest<bool>;