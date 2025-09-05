using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Application.Boards.Commands;
using TaskManager.Application.Boards.Queries;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BoardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BoardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<BoardDto>>> GetUserBoards()
    {
        var userId = GetCurrentUserId();
        var query = new GetUserBoardsQuery { UserId = userId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BoardDetailsDto>> GetBoardDetails(Guid id)
    {
        var userId = GetCurrentUserId();
        var query = new GetBoardDetailsQuery { BoardId = id, UserId = userId };
        var result = await _mediator.Send(query);
        
        if (result == null)
        {
            return NotFound("Board not found or you don't have access to it");
        }
        
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CreateBoardResult>> CreateBoard([FromBody] CreateBoardRequest request)
    {
        var userId = GetCurrentUserId();
        var command = new CreateBoardCommand
        {
            Name = request.Name,
            Description = request.Description,
            UserId = userId
        };
        
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetBoardDetails), new { id = result.Id }, result);
    }

    [HttpPost("join")]
    public async Task<ActionResult<JoinBoardResult>> JoinBoard([FromBody] JoinBoardRequest request)
    {
        var userId = GetCurrentUserId();
        var command = new JoinBoardByCodeCommand
        {
            JoinCode = request.JoinCode.ToUpper(),
            UserId = userId
        };
        
        var result = await _mediator.Send(command);
        
        if (!result.Success)
        {
            return BadRequest(result.Message);
        }
        
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException());
    }
}

public class CreateBoardRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class JoinBoardRequest
{
    public string JoinCode { get; set; } = string.Empty;
}