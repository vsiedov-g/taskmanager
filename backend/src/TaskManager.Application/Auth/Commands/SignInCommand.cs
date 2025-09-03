using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Auth.Commands;

public record SignInCommand(string Name, string Password) : IRequest<AuthResponse>;