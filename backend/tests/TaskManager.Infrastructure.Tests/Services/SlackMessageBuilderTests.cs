using AutoFixture;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using TaskManager.Application.Common.Models;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Models;
using TaskManager.Infrastructure.Services;
using TaskManager.Infrastructure.Tests.Common;

namespace TaskManager.Infrastructure.Tests.Services;

public class SlackMessageBuilderTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<ICardRepository> _mockCardRepository;
    private readonly Mock<IListRepository> _mockListRepository;
    private readonly Mock<ILogger<SlackMessageBuilder>> _mockLogger;
    private readonly SlackSettings _slackSettings;
    private readonly SlackMessageBuilder _messageBuilder;
    private readonly Fixture _fixture;

    public SlackMessageBuilderTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockCardRepository = new Mock<ICardRepository>();
        _mockListRepository = new Mock<IListRepository>();
        _mockLogger = new Mock<ILogger<SlackMessageBuilder>>();
        _fixture = FixtureExtensions.CreateSlackFixture();

        _slackSettings = new SlackSettings
        {
            Channel = "#test-channel",
            BaseUrl = "https://api.taskmanager.com",
            ClientBaseUrl = "https://app.taskmanager.com"
        };

        var options = Options.Create(_slackSettings);
        _messageBuilder = new SlackMessageBuilder(
            _mockUserRepository.Object,
            _mockCardRepository.Object,
            _mockListRepository.Object,
            options,
            _mockLogger.Object);
    }

    [Fact]
    public async Task BuildActivityMessageAsync_WithCreateAction_ShouldGenerateCorrectMessage()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var user = _fixture.Build<User>()
            .With(u => u.Id, userId)
            .With(u => u.Name, "John Doe")
            .Create();

        var card = _fixture.Build<Card>()
            .With(c => c.Id, cardId)
            .With(c => c.Title, "Test Task")
            .With(c => c.Description, "Test Description")
            .With(c => c.Priority, CardPriority.High)
            .With(c => c.Status, CardStatus.Todo)
            .With(c => c.DueDate, DateTime.Today.AddDays(7))
            .With(c => c.ListId, listId)
            .Create();

        var list = _fixture.Build<List>()
            .With(l => l.Id, listId)
            .With(l => l.Name, "To Do")
            .Create();

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync(card);
        _mockListRepository.Setup(r => r.GetByIdAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Should().NotBeNull();
        result.Text.Should().Contain("🆕");
        result.Text.Should().Contain("Test Task");
        result.Text.Should().Contain("John Doe");
        result.Text.Should().Contain("🟡 High");
        result.Text.Should().Contain("📋 Todo");
        result.Text.Should().Contain("Test Description");
        result.Channel.Should().Be("#test-channel");
        result.Blocks.Should().NotBeNull();
    }

    [Fact]
    public async Task BuildActivityMessageAsync_WithUpdateAction_ShouldGenerateCorrectMessage()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var user = _fixture.Build<User>()
            .With(u => u.Id, userId)
            .With(u => u.Name, "Jane Smith")
            .Create();

        var card = _fixture.Build<Card>()
            .With(c => c.Id, cardId)
            .With(c => c.Title, "Updated Task")
            .With(c => c.ListId, listId)
            .Create();

        var list = _fixture.Build<List>()
            .With(l => l.Id, listId)
            .With(l => l.Name, "In Progress")
            .Create();

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "UPDATE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            Description = "Changed priority to High",
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync(card);
        _mockListRepository.Setup(r => r.GetByIdAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Text.Should().Contain("✏️");
        result.Text.Should().Contain("Task updated");
        result.Text.Should().Contain("Updated Task");
        result.Text.Should().Contain("Jane Smith");
        result.Text.Should().Contain("Changed priority to High");
        result.Text.Should().Contain($"{_slackSettings.BaseUrl}/tasks/{cardId}");
    }

    [Fact]
    public async Task BuildActivityMessageAsync_WithMoveAction_ShouldGenerateCorrectMessage()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var user = _fixture.Build<User>()
            .With(u => u.Id, userId)
            .With(u => u.Name, "Bob Wilson")
            .Create();

        var card = _fixture.Build<Card>()
            .With(c => c.Id, cardId)
            .With(c => c.Title, "Moved Task")
            .With(c => c.ListId, listId)
            .Create();

        var list = _fixture.Build<List>()
            .With(l => l.Id, listId)
            .With(l => l.Name, "Done")
            .Create();

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "MOVE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            Description = "Moved from 'To Do' to 'Done'",
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync(card);
        _mockListRepository.Setup(r => r.GetByIdAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Text.Should().Contain("🔄");
        result.Text.Should().Contain("Task moved");
        result.Text.Should().Contain("Moved Task");
        result.Text.Should().Contain("Bob Wilson");
        result.Text.Should().Contain("Moved from 'To Do' to 'Done'");
    }

    [Fact]
    public async Task BuildActivityMessageAsync_WithDeleteAction_ShouldGenerateCorrectMessage()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();

        var user = _fixture.Build<User>()
            .With(u => u.Id, userId)
            .With(u => u.Name, "Alice Johnson")
            .Create();

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "DELETE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            Description = "Deleted Task",
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync((Card?)null); // Card no longer exists

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Text.Should().Contain("🗑️");
        result.Text.Should().Contain("Task deleted");
        result.Text.Should().Contain("Deleted Task");
        result.Text.Should().Contain("Alice Johnson");
    }

    [Fact]
    public async Task BuildActivityMessage_WithSlackNotificationData_ShouldGenerateCorrectMessage()
    {
        // Arrange
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "Card",
            UserId = Guid.NewGuid(),
            CardId = Guid.NewGuid(),
            EntityId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        var notificationData = new SlackNotificationData
        {
            ActivityLog = activityLog,
            UserName = "Test User",
            CardTitle = "Test Task",
            CardDescription = "Test Description",
            CardPriority = CardPriority.Critical,
            CardStatus = CardStatus.InProgress,
            CardDueDate = DateTime.Today.AddDays(3),
            ListTitle = "Test List",
            AssigneeName = "Test Assignee"
        };

        // Act
        var result = await _messageBuilder.BuildActivityMessage(notificationData);

        // Assert
        result.Should().NotBeNull();
        result.Text.Should().Contain("🆕");
        result.Text.Should().Contain("Test Task");
        result.Text.Should().Contain("Test User");
        result.Text.Should().Contain("🔴 Critical");
        result.Text.Should().Contain("⏳ InProgress");
        result.Text.Should().Contain("Test Description");
        result.Channel.Should().Be("#test-channel");
        result.Blocks.Should().NotBeNull();
    }

    [Theory]
    [InlineData(CardPriority.Critical, "🔴")]
    [InlineData(CardPriority.High, "🟡")]
    [InlineData(CardPriority.Medium, "🔵")]
    [InlineData(CardPriority.Low, "⚪")]
    public async Task BuildActivityMessageAsync_ShouldUseCorrectPriorityEmoji(CardPriority priority, string expectedEmoji)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var user = _fixture.Build<User>()
            .With(u => u.Id, userId)
            .With(u => u.Name, "Test User")
            .Create();

        var card = _fixture.Build<Card>()
            .With(c => c.Id, cardId)
            .With(c => c.Title, "Test Task")
            .With(c => c.Priority, priority)
            .With(c => c.ListId, listId)
            .Create();

        var list = _fixture.Build<List>()
            .With(l => l.Id, listId)
            .With(l => l.Name, "Test List")
            .Create();

        var activityLog = new ActivityLog
        {
            Action = "CREATE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync(card);
        _mockListRepository.Setup(r => r.GetByIdAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Text.Should().Contain($"{expectedEmoji} {priority}");
    }

    [Theory]
    [InlineData(CardStatus.Todo, "📋")]
    [InlineData(CardStatus.InProgress, "⏳")]
    [InlineData(CardStatus.Done, "✅")]
    public async Task BuildActivityMessageAsync_ShouldUseCorrectStatusEmoji(CardStatus status, string expectedEmoji)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var user = _fixture.Build<User>()
            .With(u => u.Id, userId)
            .With(u => u.Name, "Test User")
            .Create();

        var card = _fixture.Build<Card>()
            .With(c => c.Id, cardId)
            .With(c => c.Title, "Test Task")
            .With(c => c.Status, status)
            .With(c => c.ListId, listId)
            .Create();

        var list = _fixture.Build<List>()
            .With(l => l.Id, listId)
            .With(l => l.Name, "Test List")
            .Create();

        var activityLog = new ActivityLog
        {
            Action = "CREATE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync(card);
        _mockListRepository.Setup(r => r.GetByIdAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Text.Should().Contain($"{expectedEmoji} {status}");
    }

    [Fact]
    public async Task BuildActivityMessageAsync_WithNullUser_ShouldUseUnknownUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var card = _fixture.Build<Card>()
            .With(c => c.Id, cardId)
            .With(c => c.Title, "Test Task")
            .With(c => c.ListId, listId)
            .Create();

        var list = _fixture.Build<List>()
            .With(l => l.Id, listId)
            .With(l => l.Name, "Test List")
            .Create();

        var activityLog = new ActivityLog
        {
            Action = "CREATE",
            EntityType = "Card",
            UserId = userId,
            CardId = cardId,
            EntityId = cardId,
            CreatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync((User?)null);
        _mockCardRepository.Setup(r => r.GetByIdAsync(cardId))
            .ReturnsAsync(card);
        _mockListRepository.Setup(r => r.GetByIdAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _messageBuilder.BuildActivityMessageAsync(activityLog);

        // Assert
        result.Text.Should().Contain("Unknown User");
    }
}