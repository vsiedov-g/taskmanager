namespace TaskManager.Domain.Entities;

public class List
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; } = 0;

    // Navigation properties
    public virtual ICollection<Card> Cards { get; set; } = new List<Card>();
}