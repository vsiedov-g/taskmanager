using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Lists.Commands;

public record ReorderListsCommand(IEnumerable<Guid> ListIds) : IRequest<IEnumerable<ListDto>>;