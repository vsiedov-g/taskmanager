using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivityLogsController : ControllerBase
{
    private readonly TaskManagerContext _context;

    public ActivityLogsController(TaskManagerContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogs(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50)
    {
        var skip = (page - 1) * pageSize;
        
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityLog>> GetActivityLog(Guid id)
    {
        var activityLog = await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (activityLog == null)
        {
            return NotFound();
        }

        return activityLog;
    }

    [HttpGet("by-card/{cardId}")]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogsByCard(Guid cardId)
    {
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Where(a => a.CardId == cardId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogsByUser(Guid userId)
    {
        return await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ActivityLog>> CreateActivityLog(ActivityLog activityLog)
    {
        activityLog.Id = Guid.NewGuid();
        activityLog.CreatedAt = DateTime.UtcNow;
        
        _context.ActivityLogs.Add(activityLog);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetActivityLog), new { id = activityLog.Id }, activityLog);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ActivityLog>> UpdateActivityLog(Guid id, ActivityLog activityLog)
    {
        if (id != activityLog.Id)
        {
            return BadRequest();
        }

        _context.Entry(activityLog).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ActivityLogExists(id))
            {
                return NotFound();
            }
            throw;
        }

        var updatedActivityLog = await _context.ActivityLogs
            .Include(a => a.User)
            .Include(a => a.Card)
            .FirstOrDefaultAsync(a => a.Id == id);

        return Ok(updatedActivityLog);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivityLog(Guid id)
    {
        var activityLog = await _context.ActivityLogs.FindAsync(id);
        if (activityLog == null)
        {
            return NotFound();
        }

        _context.ActivityLogs.Remove(activityLog);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ActivityLogExists(Guid id)
    {
        return _context.ActivityLogs.Any(e => e.Id == id);
    }
}