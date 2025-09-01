using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Lists.Queries;

public record GetListByIdQuery(Guid Id) : IRequest<ListDto?>;