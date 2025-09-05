using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Lists.Commands;

public record CreateListCommand(string Title, int Position, Guid BoardId) : IRequest<ListDto>;