using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Cards.Handlers;
using TaskManager.Application.Cards.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Cards.Handlers;

public class GetCardsQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<ICardRepository> _cardRepositoryMock;
    private readonly GetCardsQueryHandler _handler;

    public GetCardsQueryHandlerTests()
    {
        _fixture = new Fixture();
        _cardRepositoryMock = new Mock<ICardRepository>();
        _handler = new GetCardsQueryHandler(_cardRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithMultipleCards_ReturnsAllCards()
    {
        // Arrange
        var user1 = new User { Id = Guid.NewGuid(), Name = "User 1", PasswordHash = "hash" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "User 2", PasswordHash = "hash" };
        var list1 = new List { Id = Guid.NewGuid(), Name = "To Do", Position = 1, BoardId = Guid.NewGuid() };
        var list2 = new List { Id = Guid.NewGuid(), Name = "In Progress", Position = 2, BoardId = Guid.NewGuid() };

        var card1 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 1",
            Description = "Description 1",
            Status = CardStatus.Todo,
            Priority = CardPriority.High,
            DueDate = DateTime.UtcNow.AddDays(3),
            Position = 1,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
            AssigneeId = user1.Id,
            Assignee = user1,
            ListId = list1.Id,
            List = list1,
            ProjectId = Guid.NewGuid()
        };

        var card2 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 2",
            Description = "Description 2",
            Status = CardStatus.InProgress,
            Priority = CardPriority.Medium,
            Position = 2,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = user2.Id,
            Assignee = user2,
            ListId = list2.Id,
            List = list2,
            ProjectId = null
        };

        var card3 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 3",
            Description = "Description 3",
            Status = CardStatus.Done,
            Priority = CardPriority.Low,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = null,
            Assignee = null,
            ListId = list1.Id,
            List = list1,
            ProjectId = null
        };

        var cards = new List<Card> { card1, card2, card3 };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(3);

        var card1Dto = cardList.First(c => c.Id == card1.Id);
        card1Dto.Title.Should().Be("Card 1");
        card1Dto.Description.Should().Be("Description 1");
        card1Dto.Status.Should().Be(CardStatus.Todo);
        card1Dto.Priority.Should().Be(CardPriority.High);
        card1Dto.DueDate.Should().Be(card1.DueDate);
        card1Dto.Position.Should().Be(1);
        card1Dto.AssigneeId.Should().Be(user1.Id);
        card1Dto.AssigneeName.Should().Be("User 1");
        card1Dto.ListId.Should().Be(list1.Id);
        card1Dto.ListName.Should().Be("To Do");
        card1Dto.ProjectId.Should().Be(card1.ProjectId);
        card1Dto.Assignee.Should().NotBeNull();
        card1Dto.Assignee!.Id.Should().Be(user1.Id);
        card1Dto.Assignee.Name.Should().Be("User 1");

        var card2Dto = cardList.First(c => c.Id == card2.Id);
        card2Dto.Title.Should().Be("Card 2");
        card2Dto.Status.Should().Be(CardStatus.InProgress);
        card2Dto.AssigneeName.Should().Be("User 2");
        card2Dto.ListName.Should().Be("In Progress");
        card2Dto.ProjectId.Should().BeNull();

        var card3Dto = cardList.First(c => c.Id == card3.Id);
        card3Dto.Title.Should().Be("Card 3");
        card3Dto.Status.Should().Be(CardStatus.Done);
        card3Dto.AssigneeId.Should().BeNull();
        card3Dto.AssigneeName.Should().BeNull();
        card3Dto.Assignee.Should().BeNull();

        _cardRepositoryMock.Verify(x => x.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNoCards_ReturnsEmptyCollection()
    {
        // Arrange
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<Card>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();

        _cardRepositoryMock.Verify(x => x.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCardWithoutAssignee_ReturnsDtoWithNullAssignee()
    {
        // Arrange
        var list = new List { Id = Guid.NewGuid(), Name = "Test List", Position = 1, BoardId = Guid.NewGuid() };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Unassigned Card",
            Description = "No assignee",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = null,
            Assignee = null,
            ListId = list.Id,
            List = list,
            ProjectId = null
        };

        var cards = new List<Card> { card };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);

        var cardDto = cardList.First();
        cardDto.AssigneeId.Should().BeNull();
        cardDto.AssigneeName.Should().BeNull();
        cardDto.Assignee.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithCardWithoutList_ReturnsDtoWithEmptyListName()
    {
        // Arrange
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Without List",
            Description = "No list",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid(),
            List = null, // No list loaded
            ProjectId = null
        };

        var cards = new List<Card> { card };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);

        var cardDto = cardList.First();
        cardDto.ListName.Should().Be("");
    }

    [Theory]
    [InlineData(CardStatus.Todo)]
    [InlineData(CardStatus.InProgress)]
    [InlineData(CardStatus.Done)]
    public async Task Handle_WithDifferentStatuses_ReturnsCardsWithCorrectStatuses(CardStatus status)
    {
        // Arrange
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Status Test Card",
            Status = status,
            Priority = CardPriority.Medium,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var cards = new List<Card> { card };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);
        cardList.First().Status.Should().Be(status);
    }

    [Theory]
    [InlineData(CardPriority.Low)]
    [InlineData(CardPriority.Medium)]
    [InlineData(CardPriority.High)]
    [InlineData(CardPriority.Critical)]
    public async Task Handle_WithDifferentPriorities_ReturnsCardsWithCorrectPriorities(CardPriority priority)
    {
        // Arrange
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Priority Test Card",
            Status = CardStatus.Todo,
            Priority = priority,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var cards = new List<Card> { card };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);
        cardList.First().Priority.Should().Be(priority);
    }

    [Fact]
    public async Task Handle_WithCardWithDueDate_ReturnsCardWithDueDate()
    {
        // Arrange
        var dueDate = DateTime.UtcNow.AddDays(7);
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card With Due Date",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            DueDate = dueDate,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var cards = new List<Card> { card };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);
        cardList.First().DueDate.Should().Be(dueDate);
    }

    [Fact]
    public async Task Handle_WithCardWithoutDueDate_ReturnsCardWithNullDueDate()
    {
        // Arrange
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Without Due Date",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            DueDate = null,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = Guid.NewGuid()
        };

        var cards = new List<Card> { card };
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);
        cardList.First().DueDate.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var query = new GetCardsQuery();

        _cardRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }
}