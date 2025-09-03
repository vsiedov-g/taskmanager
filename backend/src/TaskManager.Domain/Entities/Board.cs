namespace TaskManager.Domain.Entities;

public class Board
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User Owner { get; set; } = null!;
    public virtual ICollection<BoardMember> Members { get; set; } = new List<BoardMember>();
    public virtual ICollection<List> Lists { get; set; } = new List<List>();
}