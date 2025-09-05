using FluentAssertions;
using TaskManager.Application.Cards.Commands;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Tests.Cards.Commands;

public class CreateCardCommandTests
{
    [Fact]
    public void CreateCardCommand_Creation_SetsProperties()
    {
        // Arrange
        var title = "Test Card";
        var description = "Test Description";
        var status = CardStatus.Todo;
        var priority = CardPriority.High;
        var dueDate = DateTime.UtcNow.AddDays(7);
        var position = 1;
        var assigneeId = Guid.NewGuid();
        var listId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // Act
        var command = new CreateCardCommand(
            title,
            description,
            status,
            priority,
            dueDate,
            position,
            assigneeId,
            listId,
            projectId);

        // Assert
        command.Title.Should().Be(title);
        command.Description.Should().Be(description);
        command.Status.Should().Be(status);
        command.Priority.Should().Be(priority);
        command.DueDate.Should().Be(dueDate);
        command.Position.Should().Be(position);
        command.AssigneeId.Should().Be(assigneeId);
        command.ListId.Should().Be(listId);
        command.ProjectId.Should().Be(projectId);
    }

    [Fact]
    public void CreateCardCommand_WithNullAssignee_CreatesCorrectly()
    {
        // Arrange & Act
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            0,
            null,
            Guid.NewGuid(),
            null);

        // Assert
        command.AssigneeId.Should().BeNull();
        command.ProjectId.Should().BeNull();
        command.DueDate.Should().BeNull();
    }

    [Theory]
    [InlineData("", "")]
    [InlineData("Card", "")]
    [InlineData("", "Description")]
    [InlineData("Very Long Card Title That Exceeds Normal Limits", "Very detailed description")]
    public void CreateCardCommand_WithVariousStrings_CreatesCorrectly(string title, string description)
    {
        // Act
        var command = new CreateCardCommand(
            title,
            description,
            CardStatus.InProgress,
            CardPriority.Low,
            DateTime.UtcNow,
            5,
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        command.Title.Should().Be(title);
        command.Description.Should().Be(description);
    }

    [Theory]
    [InlineData(CardStatus.Todo)]
    [InlineData(CardStatus.InProgress)]
    [InlineData(CardStatus.Done)]
    public void CreateCardCommand_WithAllStatuses_CreatesCorrectly(CardStatus status)
    {
        // Act
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            status,
            CardPriority.Medium,
            null,
            0,
            null,
            Guid.NewGuid(),
            null);

        // Assert
        command.Status.Should().Be(status);
    }

    [Theory]
    [InlineData(CardPriority.Low)]
    [InlineData(CardPriority.Medium)]
    [InlineData(CardPriority.High)]
    [InlineData(CardPriority.Critical)]
    public void CreateCardCommand_WithAllPriorities_CreatesCorrectly(CardPriority priority)
    {
        // Act
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            CardStatus.Todo,
            priority,
            null,
            0,
            null,
            Guid.NewGuid(),
            null);

        // Assert
        command.Priority.Should().Be(priority);
    }

    [Theory]
    [InlineData(-10)]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(999)]
    public void CreateCardCommand_WithVariousPositions_CreatesCorrectly(int position)
    {
        // Act
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            position,
            null,
            Guid.NewGuid(),
            null);

        // Assert
        command.Position.Should().Be(position);
    }
}