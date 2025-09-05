using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.ActivityLogs.Commands;
using TaskManager.Application.ActivityLogs.Queries;
using TaskManager.Domain.Entities;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivityLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ActivityLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogs(
        [FromQuery] Guid? boardId = null,
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50)
    {
        var query = new GetActivityLogsQuery
        {
            BoardId = boardId,
            Page = page,
            PageSize = pageSize
        };

        var activityLogs = await _mediator.Send(query);
        return Ok(activityLogs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityLog>> GetActivityLog(Guid id)
    {
        var query = new GetActivityLogByIdQuery(id);
        var activityLog = await _mediator.Send(query);

        if (activityLog == null)
        {
            return NotFound();
        }

        return Ok(activityLog);
    }

    [HttpGet("by-card/{cardId}")]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogsByCard(Guid cardId)
    {
        var query = new GetActivityLogsByCardQuery(cardId);
        var activityLogs = await _mediator.Send(query);
        return Ok(activityLogs);
    }

    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogsByUser(Guid userId)
    {
        var query = new GetActivityLogsByUserQuery(userId);
        var activityLogs = await _mediator.Send(query);
        return Ok(activityLogs);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityLog>> CreateActivityLog([FromBody] CreateActivityLogRequest request)
    {
        var command = new CreateActivityLogCommand
        {
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            UserId = request.UserId,
            CardId = request.CardId
        };

        var activityLog = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetActivityLog), new { id = activityLog.Id }, activityLog);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ActivityLog>> UpdateActivityLog(Guid id, [FromBody] UpdateActivityLogRequest request)
    {
        var command = new UpdateActivityLogCommand
        {
            Id = id,
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            UserId = request.UserId,
            CardId = request.CardId
        };

        var activityLog = await _mediator.Send(command);

        if (activityLog == null)
        {
            return NotFound();
        }

        return Ok(activityLog);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivityLog(Guid id)
    {
        var command = new DeleteActivityLogCommand(id);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}

public class CreateActivityLogRequest
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public Guid? CardId { get; set; }
}

public class UpdateActivityLogRequest
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public Guid? CardId { get; set; }
}