using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Data.Repositories;

namespace TaskManager.Infrastructure.Tests.Data.Repositories;

public class BoardRepositoryTests : IDisposable
{
    private readonly TaskManagerContext _context;
    private readonly BoardRepository _repository;
    private bool _disposed;

    public BoardRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagerContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagerContext(options);
        _repository = new BoardRepository(_context);
        
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingBoard_ReturnsBoard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Test Board",
            Description = "Test Description",
            JoinCode = "ABC123",
            OwnerId = owner.Id,
            Owner = owner,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(board.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(board.Id);
        result.Name.Should().Be(board.Name);
        result.Owner.Should().NotBeNull();
        result.Owner.Name.Should().Be(owner.Name);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentBoard_ReturnsNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByJoinCodeAsync_WithExistingCode_ReturnsBoard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var joinCode = "XYZ789";
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Test Board",
            JoinCode = joinCode,
            OwnerId = owner.Id,
            Owner = owner,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByJoinCodeAsync(joinCode);

        // Assert
        result.Should().NotBeNull();
        result!.JoinCode.Should().Be(joinCode);
        result.Name.Should().Be(board.Name);
    }

    [Fact]
    public async Task GetByJoinCodeAsync_WithNonExistentCode_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByJoinCodeAsync("NONEXISTENT");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserBoardsAsync_WithUserBoards_ReturnsBoards()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Name = "User", PasswordHash = "hash" };
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        
        var board1 = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Board 1",
            JoinCode = "ABC123",
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var board2 = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Board 2",
            JoinCode = "DEF456",
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var member1 = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = board1.Id,
            UserId = user.Id,
            Role = BoardRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        var member2 = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = board2.Id,
            UserId = user.Id,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        await _context.Users.AddRangeAsync(user, owner);
        await _context.Boards.AddRangeAsync(board1, board2);
        await _context.BoardMembers.AddRangeAsync(member1, member2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetUserBoardsAsync(user.Id);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(b => b.Name == "Board 1");
        result.Should().Contain(b => b.Name == "Board 2");
    }

    [Fact]
    public async Task GetUserBoardsAsync_WithNoBoards_ReturnsEmptyList()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var result = await _repository.GetUserBoardsAsync(userId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddAsync_WithValidBoard_AddsBoard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "New Board",
            JoinCode = "NEW123",
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.AddAsync(board);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().BeSameAs(board);
        var savedBoard = await _context.Boards.FindAsync(board.Id);
        savedBoard.Should().NotBeNull();
        savedBoard!.Name.Should().Be(board.Name);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingBoard_UpdatesBoard()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Original Name",
            JoinCode = "ABC123",
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.SaveChangesAsync();

        // Modify board
        board.Name = "Updated Name";
        board.UpdatedAt = DateTime.UtcNow;

        // Act
        var result = await _repository.UpdateAsync(board);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().BeSameAs(board);
        var updatedBoard = await _context.Boards.FindAsync(board.Id);
        updatedBoard.Should().NotBeNull();
        updatedBoard!.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingBoard_ReturnsTrue()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Board to Delete",
            JoinCode = "DEL123",
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(board.Id);
        await _context.SaveChangesAsync();

        // Assert
        result.Should().BeTrue();
        var deletedBoard = await _context.Boards.FindAsync(board.Id);
        deletedBoard.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentBoard_ReturnsFalse()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.DeleteAsync(nonExistentId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsJoinCodeUniqueAsync_WithUniqueCode_ReturnsTrue()
    {
        // Arrange
        var uniqueCode = "UNIQUE123";

        // Act
        var result = await _repository.IsJoinCodeUniqueAsync(uniqueCode);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsJoinCodeUniqueAsync_WithExistingCode_ReturnsFalse()
    {
        // Arrange
        var owner = new User { Id = Guid.NewGuid(), Name = "Owner", PasswordHash = "hash" };
        var existingCode = "EXISTING123";
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Existing Board",
            JoinCode = existingCode,
            OwnerId = owner.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Boards.AddAsync(board);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.IsJoinCodeUniqueAsync(existingCode);

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")]
    [InlineData("VERYLONGCODE123456789")]
    public async Task IsJoinCodeUniqueAsync_WithVariousCodeLengths_WorksCorrectly(string code)
    {
        // Act
        var result = await _repository.IsJoinCodeUniqueAsync(code);

        // Assert
        result.Should().BeTrue(); // All should be unique since no boards exist
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