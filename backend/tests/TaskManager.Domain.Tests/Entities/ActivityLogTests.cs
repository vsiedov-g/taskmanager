using AutoFixture;
using FluentAssertions;
using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Tests.Entities;

public class ActivityLogTests
{
    private readonly Fixture _fixture;

    public ActivityLogTests()
    {
        _fixture = new Fixture();
    }

    [Fact]
    public void ActivityLog_Creation_SetsDefaultValues()
    {
        // Act
        var activityLog = new ActivityLog();

        // Assert
        activityLog.Id.Should().Be(Guid.Empty);
        activityLog.Action.Should().BeEmpty();
        activityLog.EntityType.Should().BeEmpty();
        activityLog.EntityId.Should().Be(Guid.Empty);
        activityLog.Description.Should().BeNull();
        activityLog.CreatedAt.Should().Be(DateTime.MinValue); // Default DateTime value
        activityLog.UserId.Should().Be(Guid.Empty);
        activityLog.CardId.Should().BeNull();
    }

    [Fact]
    public void ActivityLog_SetValidProperties_Success()
    {
        // Arrange
        var activityLog = new ActivityLog();
        var action = _fixture.Create<string>();
        var entityType = _fixture.Create<string>();
        var entityId = _fixture.Create<Guid>();
        var description = _fixture.Create<string>();
        var userId = _fixture.Create<Guid>();
        var cardId = _fixture.Create<Guid>();
        var createdAt = DateTime.UtcNow.AddHours(-1);

        // Act
        activityLog.Action = action;
        activityLog.EntityType = entityType;
        activityLog.EntityId = entityId;
        activityLog.Description = description;
        activityLog.UserId = userId;
        activityLog.CardId = cardId;
        activityLog.CreatedAt = createdAt;

        // Assert
        activityLog.Action.Should().Be(action);
        activityLog.EntityType.Should().Be(entityType);
        activityLog.EntityId.Should().Be(entityId);
        activityLog.Description.Should().Be(description);
        activityLog.UserId.Should().Be(userId);
        activityLog.CardId.Should().Be(cardId);
        activityLog.CreatedAt.Should().Be(createdAt);
    }

    [Theory]
    [InlineData("CREATE")]
    [InlineData("UPDATE")]
    [InlineData("DELETE")]
    [InlineData("MOVE")]
    [InlineData("ASSIGN")]
    public void ActivityLog_SetCommonActions_Success(string action)
    {
        // Arrange
        var activityLog = new ActivityLog();

        // Act
        activityLog.Action = action;

        // Assert
        activityLog.Action.Should().Be(action);
    }

    [Theory]
    [InlineData("Card")]
    [InlineData("List")]
    [InlineData("Board")]
    [InlineData("User")]
    public void ActivityLog_SetCommonEntityTypes_Success(string entityType)
    {
        // Arrange
        var activityLog = new ActivityLog();

        // Act
        activityLog.EntityType = entityType;

        // Assert
        activityLog.EntityType.Should().Be(entityType);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void ActivityLog_SetAction_HandlesNullAndEmpty(string? action)
    {
        // Arrange
        var activityLog = new ActivityLog();

        // Act & Assert - Should not throw
        activityLog.Action = action ?? string.Empty;
        activityLog.Action.Should().Be(action ?? string.Empty);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void ActivityLog_SetEntityType_HandlesNullAndEmpty(string? entityType)
    {
        // Arrange
        var activityLog = new ActivityLog();

        // Act & Assert - Should not throw
        activityLog.EntityType = entityType ?? string.Empty;
        activityLog.EntityType.Should().Be(entityType ?? string.Empty);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void ActivityLog_SetDescription_HandlesNullAndEmpty(string? description)
    {
        // Arrange
        var activityLog = new ActivityLog();

        // Act & Assert - Should not throw
        activityLog.Description = description ?? string.Empty;
        activityLog.Description.Should().Be(description ?? string.Empty);
    }

    [Fact]
    public void ActivityLog_NavigationProperties_InitializedCorrectly()
    {
        // Arrange & Act
        var activityLog = new ActivityLog();

        // Assert
        activityLog.User.Should().BeNull();
        activityLog.Card.Should().BeNull();
    }

    [Fact]
    public void ActivityLog_CardId_CanBeNull()
    {
        // Arrange
        var activityLog = new ActivityLog();

        // Act
        activityLog.CardId = null;

        // Assert
        activityLog.CardId.Should().BeNull();
    }

    [Fact]
    public void ActivityLog_WithValidData_IsValid()
    {
        // Arrange
        var action = "CREATE";
        var entityType = "Card";
        var entityId = Guid.NewGuid();
        var description = "Created a new card";
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();

        // Act
        var activityLog = new ActivityLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Description = description,
            UserId = userId,
            CardId = cardId
        };

        // Assert
        activityLog.Action.Should().Be(action);
        activityLog.EntityType.Should().Be(entityType);
        activityLog.EntityId.Should().Be(entityId);
        activityLog.Description.Should().Be(description);
        activityLog.UserId.Should().Be(userId);
        activityLog.CardId.Should().Be(cardId);
        activityLog.Id.Should().Be(Guid.Empty); // Will be set by application layer
    }

    [Fact]
    public void ActivityLog_TwoInstances_HaveSameDefaultIds()
    {
        // Arrange & Act
        var activityLog1 = new ActivityLog();
        var activityLog2 = new ActivityLog();

        // Assert
        activityLog1.Id.Should().Be(activityLog2.Id);
        activityLog1.Id.Should().Be(Guid.Empty);
    }
}