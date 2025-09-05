using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Cards.Handlers;
using TaskManager.Application.Cards.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Cards.Handlers;

public class GetCardByIdQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<ICardRepository> _cardRepositoryMock;
    private readonly GetCardByIdQueryHandler _handler;

    public GetCardByIdQueryHandlerTests()
    {
        _fixture = new Fixture();
        _cardRepositoryMock = new Mock<ICardRepository>();
        _handler = new GetCardByIdQueryHandler(_cardRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingCard_ReturnsCardDto()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var assigneeId = Guid.NewGuid();
        var listId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var assignee = new User
        {
            Id = assigneeId,
            Name = "John Doe",
            PasswordHash = "hash"
        };

        var list = new List
        {
            Id = listId,
            Name = "To Do",
            Position = 1,
            BoardId = Guid.NewGuid()
        };

        var card = new Card
        {
            Id = cardId,
            Title = "Test Card",
            Description = "Test Description",
            Status = CardStatus.InProgress,
            Priority = CardPriority.High,
            DueDate = DateTime.UtcNow.AddDays(7),
            Position = 1,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
            AssigneeId = assigneeId,
            Assignee = assignee,
            ListId = listId,
            List = list,
            ProjectId = projectId
        };

        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync(card);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(cardId);
        result.Title.Should().Be("Test Card");
        result.Description.Should().Be("Test Description");
        result.Status.Should().Be(CardStatus.InProgress);
        result.Priority.Should().Be(CardPriority.High);
        result.DueDate.Should().Be(card.DueDate);
        result.Position.Should().Be(1);
        result.CreatedAt.Should().Be(card.CreatedAt);
        result.UpdatedAt.Should().Be(card.UpdatedAt);
        result.AssigneeId.Should().Be(assigneeId);
        result.AssigneeName.Should().Be("John Doe");
        result.ListId.Should().Be(listId);
        result.ListName.Should().Be("To Do");
        result.ProjectId.Should().Be(projectId);
        result.Assignee.Should().NotBeNull();
        result.Assignee!.Id.Should().Be(assigneeId);
        result.Assignee.Name.Should().Be("John Doe");

        _cardRepositoryMock.Verify(x => x.GetByIdWithDetailsAsync(cardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCardWithoutAssignee_ReturnsCardDtoWithNullAssignee()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var listId = Guid.NewGuid();

        var list = new List
        {
            Id = listId,
            Name = "In Progress",
            Position = 2,
            BoardId = Guid.NewGuid()
        };

        var card = new Card
        {
            Id = cardId,
            Title = "Unassigned Card",
            Description = "No assignee",
            Status = CardStatus.Todo,
            Priority = CardPriority.Low,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = null,
            Assignee = null,
            ListId = listId,
            List = list,
            ProjectId = null
        };

        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync(card);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(cardId);
        result.Title.Should().Be("Unassigned Card");
        result.AssigneeId.Should().BeNull();
        result.AssigneeName.Should().BeNull();
        result.Assignee.Should().BeNull();
        result.ListId.Should().Be(listId);
        result.ListName.Should().Be("In Progress");
        result.ProjectId.Should().BeNull();

        _cardRepositoryMock.Verify(x => x.GetByIdWithDetailsAsync(cardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCardWithoutList_ReturnsCardDtoWithEmptyListName()
    {
        // Arrange
        var cardId = Guid.NewGuid();

        var card = new Card
        {
            Id = cardId,
            Title = "Card Without List",
            Description = "No list associated",
            Status = CardStatus.Done,
            Priority = CardPriority.Medium,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid(),
            List = null // No list loaded
        };

        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync(card);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(cardId);
        result.Title.Should().Be("Card Without List");
        result.ListName.Should().Be("");

        _cardRepositoryMock.Verify(x => x.GetByIdWithDetailsAsync(cardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentCard_ReturnsNull()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync((Card?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();

        _cardRepositoryMock.Verify(x => x.GetByIdWithDetailsAsync(cardId), Times.Once);
    }

    [Theory]
    [InlineData(CardStatus.Todo, CardPriority.Low)]
    [InlineData(CardStatus.InProgress, CardPriority.Medium)]
    [InlineData(CardStatus.Done, CardPriority.High)]
    [InlineData(CardStatus.Done, CardPriority.Critical)]
    public async Task Handle_WithDifferentStatusesAndPriorities_ReturnsCorrectCard(CardStatus status, CardPriority priority)
    {
        // Arrange
        var cardId = Guid.NewGuid();
        
        var card = new Card
        {
            Id = cardId,
            Title = "Status Test Card",
            Status = status,
            Priority = priority,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync(card);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(status);
        result.Priority.Should().Be(priority);
    }

    [Fact]
    public async Task Handle_WithCardWithDueDate_ReturnsCardWithDueDate()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var dueDate = DateTime.UtcNow.AddDays(5);
        
        var card = new Card
        {
            Id = cardId,
            Title = "Card With Due Date",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            DueDate = dueDate,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync(card);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.DueDate.Should().Be(dueDate);
    }

    [Fact]
    public async Task Handle_WithCardWithoutDueDate_ReturnsCardWithNullDueDate()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        
        var card = new Card
        {
            Id = cardId,
            Title = "Card Without Due Date",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            DueDate = null,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ReturnsAsync(card);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.DueDate.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var query = new GetCardByIdQuery(cardId);

        _cardRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(cardId))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }
}