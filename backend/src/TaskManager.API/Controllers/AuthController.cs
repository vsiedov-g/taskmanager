using MediatR;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Auth.Commands;
using TaskManager.Application.DTOs;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("signin")]
    public async Task<ActionResult<AuthResponse>> SignIn([FromBody] SignInRequest request)
    {
        try
        {
            var command = new SignInCommand(request.Email, request.Password);
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred during sign in" });
        }
    }

    [HttpPost("signup")]
    public async Task<ActionResult<AuthResponse>> SignUp([FromBody] SignUpRequest request)
    {
        try
        {
            var command = new SignUpCommand(request.FirstName, request.LastName, request.Email, request.Password);
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred during sign up" });
        }
    }
}