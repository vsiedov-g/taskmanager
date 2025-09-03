namespace TaskManager.Domain.Entities;

public class BoardMember
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public Guid UserId { get; set; }
    public BoardRole Role { get; set; } = BoardRole.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Board Board { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public enum BoardRole
{
    Admin = 0,
    Member = 1
}