using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Users.Commands;

public record UpdateUserCommand(Guid Id, string FirstName, string LastName, string Email) : IRequest<UserDto?>;