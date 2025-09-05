using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Data.Repositories;

namespace TaskManager.Infrastructure.Tests.Data.Repositories;

public class CardRepositoryTests : IDisposable
{
    private readonly TaskManagerContext _context;
    private readonly CardRepository _repository;
    private bool _disposed;

    public CardRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagerContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagerContext(options);
        _repository = new CardRepository(_context);
        
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task GetAllAsync_WithNoCards_ReturnsEmpty()
    {
        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithCards_ReturnsOrderedByPosition()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "List", BoardId = board.Id, Position = 1 };
        
        var card1 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 1",
            Position = 2,
            ListId = list.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var card2 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 2", 
            Position = 1,
            ListId = list.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);
        await _context.Cards.AddRangeAsync(card1, card2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        var cardList = result.ToList();
        cardList[0].Position.Should().Be(1);
        cardList[1].Position.Should().Be(2);
        cardList[0].Title.Should().Be("Card 2");
        cardList[1].Title.Should().Be("Card 1");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingCard_ReturnsCard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "List", BoardId = board.Id, Position = 1 };
        
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Test Card",
            Description = "Test Description",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            Position = 1,
            ListId = list.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);
        await _context.Cards.AddAsync(card);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(card.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(card.Id);
        result.Title.Should().Be("Test Card");
        result.Status.Should().Be(CardStatus.Todo);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentCard_ReturnsNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdWithDetailsAsync_WithExistingCard_ReturnsCardWithDetails()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var assignee = new User { Id = Guid.NewGuid(), Name = "Assignee", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "Test List", BoardId = board.Id, Position = 1 };
        
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Detailed Card",
            AssigneeId = assignee.Id,
            ListId = list.Id,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddRangeAsync(owner, assignee);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);
        await _context.Cards.AddAsync(card);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdWithDetailsAsync(card.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Assignee.Should().NotBeNull();
        result.Assignee!.Name.Should().Be("Assignee");
        result.List.Should().NotBeNull();
        result.List.Name.Should().Be("Test List");
        result.ActivityLogs.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByListIdAsync_WithCardsInList_ReturnsOrderedCards()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list1 = new List { Id = Guid.NewGuid(), Name = "List 1", BoardId = board.Id, Position = 1 };
        var list2 = new List { Id = Guid.NewGuid(), Name = "List 2", BoardId = board.Id, Position = 2 };
        
        var card1 = new Card { Id = Guid.NewGuid(), Title = "Card 1", Position = 3, ListId = list1.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var card2 = new Card { Id = Guid.NewGuid(), Title = "Card 2", Position = 1, ListId = list1.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var card3 = new Card { Id = Guid.NewGuid(), Title = "Card 3", Position = 2, ListId = list1.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var card4 = new Card { Id = Guid.NewGuid(), Title = "Card 4", Position = 1, ListId = list2.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddRangeAsync(list1, list2);
        await _context.Cards.AddRangeAsync(card1, card2, card3, card4);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByListIdAsync(list1.Id);

        // Assert
        result.Should().HaveCount(3);
        var cardList = result.ToList();
        cardList[0].Position.Should().Be(1);
        cardList[1].Position.Should().Be(2);
        cardList[2].Position.Should().Be(3);
        cardList[0].Title.Should().Be("Card 2");
        cardList[1].Title.Should().Be("Card 3");
        cardList[2].Title.Should().Be("Card 1");
    }

    [Fact]
    public async Task GetByListIdAsync_WithEmptyList_ReturnsEmpty()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "Empty List", BoardId = board.Id, Position = 1 };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByListIdAsync(list.Id);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddAsync_WithValidCard_AddsCard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "List", BoardId = board.Id, Position = 1 };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "New Card",
            Description = "New Description",
            Status = CardStatus.InProgress,
            Priority = CardPriority.High,
            Position = 1,
            ListId = list.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);

        // Act
        await _repository.AddAsync(card);
        await _context.SaveChangesAsync();

        // Assert
        var savedCard = await _context.Cards.FindAsync(card.Id);
        savedCard.Should().NotBeNull();
        savedCard!.Title.Should().Be("New Card");
        savedCard.Status.Should().Be(CardStatus.InProgress);
    }

    [Fact]
    public async Task Update_WithExistingCard_UpdatesCard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "List", BoardId = board.Id, Position = 1 };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Original Title",
            Status = CardStatus.Todo,
            Position = 1,
            ListId = list.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);
        await _context.Cards.AddAsync(card);
        await _context.SaveChangesAsync();

        // Modify card
        card.Title = "Updated Title";
        card.Status = CardStatus.Done;
        card.UpdatedAt = DateTime.UtcNow;

        // Act
        _repository.Update(card);
        await _context.SaveChangesAsync();

        // Assert
        var updatedCard = await _context.Cards.FindAsync(card.Id);
        updatedCard.Should().NotBeNull();
        updatedCard!.Title.Should().Be("Updated Title");
        updatedCard.Status.Should().Be(CardStatus.Done);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingCard_RemovesCard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board { Id = Guid.NewGuid(), Name = "Board", JoinCode = "ABC123", OwnerId = owner.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var list = new List { Id = Guid.NewGuid(), Name = "List", BoardId = board.Id, Position = 1 };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card to Delete",
            Position = 1,
            ListId = list.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.Lists.AddAsync(list);
        await _context.Cards.AddAsync(card);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteAsync(card.Id);
        await _context.SaveChangesAsync();

        // Assert
        var deletedCard = await _context.Cards.FindAsync(card.Id);
        deletedCard.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentCard_DoesNotThrow()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act & Assert
        var act = async () => await _repository.DeleteAsync(nonExistentId);
        await act.Should().NotThrowAsync();
        
        await _context.SaveChangesAsync();
        
        var cardCount = await _context.Cards.CountAsync();
        cardCount.Should().Be(0);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _context?.Dispose();
            _disposed = true;
        }
    }
}