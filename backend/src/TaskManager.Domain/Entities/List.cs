namespace TaskManager.Domain.Entities;

public class List
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; } = 0;
    public Guid BoardId { get; set; }

    // Navigation properties
    public virtual Board Board { get; set; } = null!;
    public virtual ICollection<Card> Cards { get; set; } = new List<Card>();
}