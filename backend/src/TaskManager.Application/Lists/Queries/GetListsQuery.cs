using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Lists.Queries;

public record GetListsQuery(Guid BoardId) : IRequest<IEnumerable<ListDto>>;