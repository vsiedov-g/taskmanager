using MediatR;

namespace TaskManager.Application.ActivityLogs.Commands;

public class DeleteActivityLogCommand : IRequest<bool>
{
    public Guid Id { get; set; }

    public DeleteActivityLogCommand(Guid id)
    {
        Id = id;
    }
}