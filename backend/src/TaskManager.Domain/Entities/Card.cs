namespace TaskManager.Domain.Entities;

public class Card
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CardStatus Status { get; set; } = CardStatus.Todo;
    public CardPriority Priority { get; set; } = CardPriority.Medium;
    public DateTime? DueDate { get; set; }
    public int Position { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public Guid? AssigneeId { get; set; }
    public Guid ListId { get; set; }
    public Guid? ProjectId { get; set; }

    // Navigation properties
    public virtual User? Assignee { get; set; }
    public virtual List List { get; set; } = null!;
    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}

public enum CardStatus
{
    Todo = 0,
    InProgress = 1,
    Done = 2
}

public enum CardPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}