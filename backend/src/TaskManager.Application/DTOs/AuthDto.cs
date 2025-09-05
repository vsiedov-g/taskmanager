using TaskManager.Domain.Entities;

namespace TaskManager.Application.DTOs;

public class SignInRequest
{
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class SignUpRequest
{
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class ListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public ICollection<CardDto> Cards { get; set; } = new List<CardDto>();
}

public class CardDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CardStatus Status { get; set; }
    public CardPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public Guid ListId { get; set; }
    public string ListName { get; set; } = string.Empty;
    public Guid? ProjectId { get; set; }
    public UserDto? Assignee { get; set; }
}

