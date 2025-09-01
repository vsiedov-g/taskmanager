using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Commands;
using TaskManager.Application.Lists.Queries;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ListsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListDto>>> GetLists()
    {
        var query = new GetListsQuery();
        var lists = await _mediator.Send(query);
        return Ok(lists);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ListDto>> GetList(Guid id)
    {
        var query = new GetListByIdQuery(id);
        var list = await _mediator.Send(query);

        if (list == null)
        {
            return NotFound();
        }

        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<ListDto>> CreateList([FromBody] CreateListRequest request)
    {
        var command = new CreateListCommand(request.Title, request.Position);
        var list = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetList), new { id = list.Id }, list);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ListDto>> UpdateList(Guid id, [FromBody] UpdateListRequest request)
    {
        var command = new UpdateListCommand(id, request.Title, request.Position);
        var list = await _mediator.Send(command);

        if (list == null)
        {
            return NotFound();
        }

        return Ok(list);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(Guid id)
    {
        var command = new DeleteListCommand(id);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("reorder")]
    public async Task<ActionResult<IEnumerable<ListDto>>> ReorderLists([FromBody] ReorderListsRequest request)
    {
        var command = new ReorderListsCommand(request.ListIds);
        var lists = await _mediator.Send(command);
        return Ok(lists);
    }
}

public class CreateListRequest
{
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
}

public class UpdateListRequest
{
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
}

public class ReorderListsRequest
{
    public List<Guid> ListIds { get; set; } = new();
}