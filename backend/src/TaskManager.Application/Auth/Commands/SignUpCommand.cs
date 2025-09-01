using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Auth.Commands;

public record SignUpCommand(string FirstName, string LastName, string Email, string Password) : IRequest<AuthResponse>;