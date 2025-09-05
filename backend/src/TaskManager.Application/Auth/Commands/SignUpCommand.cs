using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Auth.Commands;

public record SignUpCommand(string Name, string Password) : IRequest<AuthResponse>;