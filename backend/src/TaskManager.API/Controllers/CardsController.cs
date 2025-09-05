using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Cards.Queries;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CardDto>>> GetCards()
    {
        var query = new GetCardsQuery();
        var cards = await _mediator.Send(query);
        return Ok(cards);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CardDto>> GetCard(Guid id)
    {
        var query = new GetCardByIdQuery(id);
        var card = await _mediator.Send(query);

        if (card == null)
        {
            return NotFound();
        }

        return Ok(card);
    }

    [HttpGet("by-list/{listId}")]
    public async Task<ActionResult<IEnumerable<CardDto>>> GetCardsByList(Guid listId)
    {
        var query = new GetCardsByListQuery(listId);
        var cards = await _mediator.Send(query);
        return Ok(cards);
    }

    [HttpPost]
    public async Task<ActionResult<CardDto>> CreateCard([FromBody] CreateCardRequest request)
    {
        var command = new CreateCardCommand(
            request.Title,
            request.Description,
            request.Status,
            request.Priority,
            request.DueDate,
            request.Position,
            request.AssigneeId,
            request.ListId,
            request.ProjectId);
        var card = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CardDto>> UpdateCard(Guid id, [FromBody] UpdateCardRequest request)
    {
        var command = new UpdateCardCommand(
            id,
            request.Title,
            request.Description,
            request.Status,
            request.Priority,
            request.DueDate,
            request.Position,
            request.AssigneeId,
            request.ListId,
            request.ProjectId);
        var card = await _mediator.Send(command);

        if (card == null)
        {
            return NotFound();
        }

        return Ok(card);
    }

    [HttpPut("{id}/move")]
    public async Task<ActionResult<CardDto>> MoveCard(Guid id, [FromBody] MoveCardRequest request)
    {
        var command = new MoveCardCommand(id, request.ListId, request.Position);
        var card = await _mediator.Send(command);

        if (card == null)
        {
            return NotFound();
        }

        return Ok(card);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCard(Guid id)
    {
        var command = new DeleteCardCommand(id);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}

public class CreateCardRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CardStatus Status { get; set; } = CardStatus.Todo;
    public CardPriority Priority { get; set; } = CardPriority.Medium;
    public DateTime? DueDate { get; set; }
    public int Position { get; set; }
    public Guid? AssigneeId { get; set; }
    public Guid ListId { get; set; }
    public Guid? ProjectId { get; set; }
}

public class UpdateCardRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CardStatus Status { get; set; } = CardStatus.Todo;
    public CardPriority Priority { get; set; } = CardPriority.Medium;
    public DateTime? DueDate { get; set; }
    public int Position { get; set; }
    public Guid? AssigneeId { get; set; }
    public Guid ListId { get; set; }
    public Guid? ProjectId { get; set; }
}

public class MoveCardRequest
{
    public Guid ListId { get; set; }
    public int Position { get; set; }
}