using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Lists.Queries;

public record GetListsQuery : IRequest<IEnumerable<ListDto>>;