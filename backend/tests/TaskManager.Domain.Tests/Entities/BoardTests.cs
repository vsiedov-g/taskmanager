using AutoFixture;
using FluentAssertions;
using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Tests.Entities;

public class BoardTests
{
    private readonly Fixture _fixture;

    public BoardTests()
    {
        _fixture = new Fixture();
    }

    [Fact]
    public void Board_Creation_SetsDefaultValues()
    {
        // Act
        var board = new Board();

        // Assert
        board.Id.Should().Be(Guid.Empty);
        board.Name.Should().BeEmpty();
        board.Description.Should().BeEmpty();
        board.JoinCode.Should().BeEmpty();
        board.OwnerId.Should().Be(Guid.Empty);
        board.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        board.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Board_SetValidProperties_Success()
    {
        // Arrange
        var board = new Board();
        var name = _fixture.Create<string>();
        var description = _fixture.Create<string>();
        var joinCode = _fixture.Create<string>();
        var ownerId = _fixture.Create<Guid>();

        // Act
        board.Name = name;
        board.Description = description;
        board.JoinCode = joinCode;
        board.OwnerId = ownerId;

        // Assert
        board.Name.Should().Be(name);
        board.Description.Should().Be(description);
        board.JoinCode.Should().Be(joinCode);
        board.OwnerId.Should().Be(ownerId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Board_SetName_HandlesNullEmptyAndWhitespace(string? name)
    {
        // Arrange
        var board = new Board();

        // Act & Assert - Should not throw
        board.Name = name ?? string.Empty;
        board.Name.Should().Be(name ?? string.Empty);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Board_SetDescription_HandlesNullAndEmpty(string? description)
    {
        // Arrange
        var board = new Board();

        // Act & Assert - Should not throw
        board.Description = description ?? string.Empty;
        board.Description.Should().Be(description ?? string.Empty);
    }

    [Fact]
    public void Board_NavigationProperties_InitializedCorrectly()
    {
        // Arrange & Act
        var board = new Board();

        // Assert
        board.Owner.Should().BeNull();
        board.Members.Should().NotBeNull();
        board.Members.Should().BeEmpty();
        board.Lists.Should().NotBeNull();
        board.Lists.Should().BeEmpty();
    }

    [Fact]
    public void Board_SetTimestamps_Success()
    {
        // Arrange
        var board = new Board();
        var createdAt = DateTime.UtcNow.AddHours(-1);
        var updatedAt = DateTime.UtcNow;

        // Act
        board.CreatedAt = createdAt;
        board.UpdatedAt = updatedAt;

        // Assert
        board.CreatedAt.Should().Be(createdAt);
        board.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void Board_WithValidData_IsValid()
    {
        // Arrange
        var name = "Project Board";
        var description = "A board for managing project tasks";
        var joinCode = "ABC123";
        var ownerId = Guid.NewGuid();

        // Act
        var board = new Board
        {
            Name = name,
            Description = description,
            JoinCode = joinCode,
            OwnerId = ownerId
        };

        // Assert
        board.Name.Should().Be(name);
        board.Description.Should().Be(description);
        board.JoinCode.Should().Be(joinCode);
        board.OwnerId.Should().Be(ownerId);
        board.Id.Should().Be(Guid.Empty); // Will be set by application layer
    }

    [Fact]
    public void Board_TwoInstances_HaveSameDefaultIds()
    {
        // Arrange & Act
        var board1 = new Board();
        var board2 = new Board();

        // Assert
        board1.Id.Should().Be(board2.Id);
        board1.Id.Should().Be(Guid.Empty);
    }
}