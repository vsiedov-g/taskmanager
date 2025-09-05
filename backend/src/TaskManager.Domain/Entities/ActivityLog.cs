namespace TaskManager.Domain.Entities;

public class ActivityLog
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty; // "Card", "List", etc.
    public Guid EntityId { get; set; }
    public string? Description { get; set; } // Human-readable description
    public DateTime CreatedAt { get; set; }

    // Foreign keys
    public Guid UserId { get; set; }
    public Guid? CardId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Card? Card { get; set; }
}