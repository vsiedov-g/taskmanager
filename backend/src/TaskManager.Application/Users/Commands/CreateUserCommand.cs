using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Users.Commands;

public record CreateUserCommand(string FirstName, string LastName, string Email, string Password) : IRequest<UserDto>;