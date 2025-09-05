using MediatR;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Users.Commands;
using TaskManager.Application.Users.Queries;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var query = new GetUsersQuery();
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var query = new GetUserByIdQuery(id);
        var user = await _mediator.Send(query);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var command = new CreateUserCommand(request.FirstName, request.LastName, request.Email, request.Password);
        var user = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var command = new UpdateUserCommand(id, request.FirstName, request.LastName, request.Email);
        var user = await _mediator.Send(command);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var command = new DeleteUserCommand(id);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}

public class CreateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}