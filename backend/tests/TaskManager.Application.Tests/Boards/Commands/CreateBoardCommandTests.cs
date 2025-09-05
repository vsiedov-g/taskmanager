using FluentAssertions;
using TaskManager.Application.Boards.Commands;

namespace TaskManager.Application.Tests.Boards.Commands;

public class CreateBoardCommandTests
{
    [Fact]
    public void CreateBoardCommand_Creation_SetsProperties()
    {
        // Arrange
        var name = "Project Board";
        var description = "A board for managing project tasks";
        var userId = Guid.NewGuid();

        // Act
        var command = new CreateBoardCommand
        {
            Name = name,
            Description = description,
            UserId = userId
        };

        // Assert
        command.Name.Should().Be(name);
        command.Description.Should().Be(description);
        command.UserId.Should().Be(userId);
    }

    [Fact]
    public void CreateBoardCommand_DefaultValues_AreCorrect()
    {
        // Act
        var command = new CreateBoardCommand();

        // Assert
        command.Name.Should().BeEmpty();
        command.Description.Should().BeEmpty();
        command.UserId.Should().Be(Guid.Empty);
    }

    [Theory]
    [InlineData("", "")]
    [InlineData("Board", "")]
    [InlineData("", "Description")]
    [InlineData("Board", "Description")]
    public void CreateBoardCommand_WithVariousStringValues_SetsProperties(string name, string description)
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var command = new CreateBoardCommand
        {
            Name = name,
            Description = description,
            UserId = userId
        };

        // Assert
        command.Name.Should().Be(name);
        command.Description.Should().Be(description);
        command.UserId.Should().Be(userId);
    }

    [Fact]
    public void CreateBoardResult_Creation_SetsProperties()
    {
        // Arrange
        var id = Guid.NewGuid();
        var name = "Test Board";
        var description = "Test Description";
        var joinCode = "ABC123";
        var createdAt = DateTime.UtcNow;

        // Act
        var result = new CreateBoardResult
        {
            Id = id,
            Name = name,
            Description = description,
            JoinCode = joinCode,
            CreatedAt = createdAt
        };

        // Assert
        result.Id.Should().Be(id);
        result.Name.Should().Be(name);
        result.Description.Should().Be(description);
        result.JoinCode.Should().Be(joinCode);
        result.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void CreateBoardResult_DefaultValues_AreCorrect()
    {
        // Act
        var result = new CreateBoardResult();

        // Assert
        result.Id.Should().Be(Guid.Empty);
        result.Name.Should().BeEmpty();
        result.Description.Should().BeEmpty();
        result.JoinCode.Should().BeEmpty();
        result.CreatedAt.Should().Be(DateTime.MinValue);
    }
}