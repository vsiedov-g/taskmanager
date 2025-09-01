using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Lists.Commands;

public record UpdateListCommand(Guid Id, string Title, int Position) : IRequest<ListDto?>;