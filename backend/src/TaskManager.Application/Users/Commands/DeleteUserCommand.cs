using MediatR;

namespace TaskManager.Application.Users.Commands;

public record DeleteUserCommand(Guid Id) : IRequest<bool>;