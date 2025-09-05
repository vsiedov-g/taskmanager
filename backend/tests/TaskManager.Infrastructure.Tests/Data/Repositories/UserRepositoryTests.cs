using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Data.Repositories;

namespace TaskManager.Infrastructure.Tests.Data.Repositories;

public class UserRepositoryTests : IDisposable
{
    private readonly TaskManagerContext _context;
    private readonly UserRepository _repository;
    private bool _disposed;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagerContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagerContext(options);
        _repository = new UserRepository(_context);
        
        // Ensure database is created
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task GetAllAsync_WithNoUsers_ReturnsEmptyList()
    {
        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithUsers_ReturnsAllUsers()
    {
        // Arrange
        var user1 = new User { Id = Guid.NewGuid(), Name = "User1", PasswordHash = "hash1" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "User2", PasswordHash = "hash2" };
        
        await _context.Users.AddRangeAsync(user1, user2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(u => u.Name == "User1");
        result.Should().Contain(u => u.Name == "User2");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingUser_ReturnsUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, Name = "TestUser", PasswordHash = "hash" };
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(userId);
        result.Name.Should().Be("TestUser");
        result.PasswordHash.Should().Be("hash");
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentUser_ReturnsNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByNameAsync_WithExistingUser_ReturnsUser()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Name = "UniqueUser", PasswordHash = "hash" };
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByNameAsync("UniqueUser");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("UniqueUser");
        result.PasswordHash.Should().Be("hash");
    }

    [Fact]
    public async Task GetByNameAsync_WithNonExistentUser_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByNameAsync("NonExistentUser");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByNameAsync_WithCaseSensitiveSearch_ReturnsCorrectUser()
    {
        // Arrange
        var user1 = new User { Id = Guid.NewGuid(), Name = "TestUser", PasswordHash = "hash1" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "testuser", PasswordHash = "hash2" };
        
        await _context.Users.AddRangeAsync(user1, user2);
        await _context.SaveChangesAsync();

        // Act
        var result1 = await _repository.GetByNameAsync("TestUser");
        var result2 = await _repository.GetByNameAsync("testuser");

        // Assert
        result1.Should().NotBeNull();
        result1!.Name.Should().Be("TestUser");
        result1.PasswordHash.Should().Be("hash1");

        result2.Should().NotBeNull();
        result2!.Name.Should().Be("testuser");
        result2.PasswordHash.Should().Be("hash2");
    }

    [Fact]
    public async Task AddAsync_WithValidUser_AddsUserToDatabase()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Name = "NewUser", PasswordHash = "newhash" };

        // Act
        await _repository.AddAsync(user);
        await _context.SaveChangesAsync();

        // Assert
        var savedUser = await _context.Users.FindAsync(user.Id);
        savedUser.Should().NotBeNull();
        savedUser!.Name.Should().Be("NewUser");
        savedUser.PasswordHash.Should().Be("newhash");
    }

    [Fact]
    public async Task AddAsync_WithMultipleUsers_AddsAllUsers()
    {
        // Arrange
        var user1 = new User { Id = Guid.NewGuid(), Name = "User1", PasswordHash = "hash1" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "User2", PasswordHash = "hash2" };

        // Act
        await _repository.AddAsync(user1);
        await _repository.AddAsync(user2);
        await _context.SaveChangesAsync();

        // Assert
        var allUsers = await _context.Users.ToListAsync();
        allUsers.Should().HaveCount(2);
        allUsers.Should().Contain(u => u.Name == "User1");
        allUsers.Should().Contain(u => u.Name == "User2");
    }

    [Fact]
    public async Task Update_WithExistingUser_UpdatesUser()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Name = "OriginalName", PasswordHash = "originalhash" };
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Modify user
        user.Name = "UpdatedName";
        user.PasswordHash = "updatedhash";

        // Act
        _repository.Update(user);
        await _context.SaveChangesAsync();

        // Assert
        var updatedUser = await _context.Users.FindAsync(user.Id);
        updatedUser.Should().NotBeNull();
        updatedUser!.Name.Should().Be("UpdatedName");
        updatedUser.PasswordHash.Should().Be("updatedhash");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingUser_RemovesUser()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Name = "ToDelete", PasswordHash = "hash" };
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteAsync(user.Id);
        await _context.SaveChangesAsync();

        // Assert
        var deletedUser = await _context.Users.FindAsync(user.Id);
        deletedUser.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentUser_DoesNotThrow()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act & Assert
        var act = async () => await _repository.DeleteAsync(nonExistentId);
        await act.Should().NotThrowAsync();
        
        await _context.SaveChangesAsync();
        
        // Verify no users were affected
        var userCount = await _context.Users.CountAsync();
        userCount.Should().Be(0);
    }

    [Theory]
    [InlineData("")]
    [InlineData("a")]
    [InlineData("VeryLongUserNameThatMightExceedNormalLimits")]
    public async Task GetByNameAsync_WithVariousNameLengths_WorksCorrectly(string name)
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Name = name, PasswordHash = "hash" };
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByNameAsync(name);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be(name);
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