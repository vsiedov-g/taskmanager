using MediatR;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Boards.Commands;

public class UpdateMemberRoleCommand : IRequest<bool>
{
    public Guid BoardId { get; set; }
    public Guid UserId { get; set; }
    public Guid TargetUserId { get; set; }
    public BoardRole Role { get; set; }
}