using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Users.Queries;

public record GetUsersQuery : IRequest<IEnumerable<UserDto>>;