using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Auth.Commands;

public record SignInCommand(string Email, string Password) : IRequest<AuthResponse>;