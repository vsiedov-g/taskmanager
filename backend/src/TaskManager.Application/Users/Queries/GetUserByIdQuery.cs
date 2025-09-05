using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Users.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto?>;