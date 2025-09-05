using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Cards.Handlers;
using TaskManager.Application.Cards.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Cards.Handlers;

public class GetCardsByListQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<ICardRepository> _cardRepositoryMock;
    private readonly GetCardsByListQueryHandler _handler;

    public GetCardsByListQueryHandlerTests()
    {
        _fixture = new Fixture();
        _cardRepositoryMock = new Mock<ICardRepository>();
        _handler = new GetCardsByListQueryHandler(_cardRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithCardsInList_ReturnsCardDtos()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var user1 = new User { Id = Guid.NewGuid(), Name = "User 1", PasswordHash = "hash" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "User 2", PasswordHash = "hash" };
        var list = new List { Id = listId, Name = "Test List", Position = 1, BoardId = Guid.NewGuid() };

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
            ListId = listId,
            List = list,
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
            ListId = listId,
            List = list,
            ProjectId = null
        };

        var card3 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 3",
            Description = "Description 3",
            Status = CardStatus.Done,
            Priority = CardPriority.Low,
            Position = 3,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = null,
            Assignee = null,
            ListId = listId,
            List = list,
            ProjectId = null
        };

        var cards = new List<Card> { card1, card2, card3 };
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
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
        card1Dto.ListId.Should().Be(listId);
        card1Dto.ListName.Should().Be("Test List");
        card1Dto.ProjectId.Should().Be(card1.ProjectId);
        card1Dto.Assignee.Should().NotBeNull();
        card1Dto.Assignee!.Id.Should().Be(user1.Id);
        card1Dto.Assignee.Name.Should().Be("User 1");

        var card2Dto = cardList.First(c => c.Id == card2.Id);
        card2Dto.Title.Should().Be("Card 2");
        card2Dto.Status.Should().Be(CardStatus.InProgress);
        card2Dto.Priority.Should().Be(CardPriority.Medium);
        card2Dto.Position.Should().Be(2);
        card2Dto.AssigneeName.Should().Be("User 2");
        card2Dto.ProjectId.Should().BeNull();

        var card3Dto = cardList.First(c => c.Id == card3.Id);
        card3Dto.Title.Should().Be("Card 3");
        card3Dto.Status.Should().Be(CardStatus.Done);
        card3Dto.Priority.Should().Be(CardPriority.Low);
        card3Dto.Position.Should().Be(3);
        card3Dto.AssigneeId.Should().BeNull();
        card3Dto.AssigneeName.Should().BeNull();
        card3Dto.Assignee.Should().BeNull();

        _cardRepositoryMock.Verify(x => x.GetByListIdAsync(listId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyList_ReturnsEmptyCollection()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
            .ReturnsAsync(new List<Card>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();

        _cardRepositoryMock.Verify(x => x.GetByListIdAsync(listId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCardsWithoutAssignees_ReturnsCardsWithNullAssignees()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var list = new List { Id = listId, Name = "Test List", Position = 1, BoardId = Guid.NewGuid() };

        var card1 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Unassigned Card 1",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = null,
            Assignee = null,
            ListId = listId,
            List = list
        };

        var card2 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Unassigned Card 2",
            Status = CardStatus.InProgress,
            Priority = CardPriority.Low,
            Position = 2,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = null,
            Assignee = null,
            ListId = listId,
            List = list
        };

        var cards = new List<Card> { card1, card2 };
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(2);

        cardList.Should().AllSatisfy(card =>
        {
            card.AssigneeId.Should().BeNull();
            card.AssigneeName.Should().BeNull();
            card.Assignee.Should().BeNull();
        });
    }

    [Fact]
    public async Task Handle_WithCardsWithoutListDetails_ReturnsCardsWithEmptyListName()
    {
        // Arrange
        var listId = Guid.NewGuid();

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Without List Details",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = listId,
            List = null // No list details loaded
        };

        var cards = new List<Card> { card };
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
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

    [Fact]
    public async Task Handle_WithSingleCard_ReturnsSingleCardDto()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var user = new User { Id = Guid.NewGuid(), Name = "Test User", PasswordHash = "hash" };
        var list = new List { Id = listId, Name = "Single Card List", Position = 1, BoardId = Guid.NewGuid() };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Single Card",
            Description = "Only card in list",
            Status = CardStatus.InProgress,
            Priority = CardPriority.High,
            DueDate = DateTime.UtcNow.AddDays(5),
            Position = 1,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow,
            AssigneeId = user.Id,
            Assignee = user,
            ListId = listId,
            List = list,
            ProjectId = Guid.NewGuid()
        };

        var cards = new List<Card> { card };
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);

        var cardDto = cardList.First();
        cardDto.Id.Should().Be(card.Id);
        cardDto.Title.Should().Be("Single Card");
        cardDto.Description.Should().Be("Only card in list");
        cardDto.Status.Should().Be(CardStatus.InProgress);
        cardDto.Priority.Should().Be(CardPriority.High);
        cardDto.DueDate.Should().Be(card.DueDate);
        cardDto.Position.Should().Be(1);
        cardDto.AssigneeId.Should().Be(user.Id);
        cardDto.AssigneeName.Should().Be("Test User");
        cardDto.ListId.Should().Be(listId);
        cardDto.ListName.Should().Be("Single Card List");
        cardDto.ProjectId.Should().Be(card.ProjectId);
        cardDto.Assignee.Should().NotBeNull();
        cardDto.Assignee!.Id.Should().Be(user.Id);
        cardDto.Assignee.Name.Should().Be("Test User");
    }

    [Theory]
    [InlineData(CardStatus.Todo, CardPriority.Low)]
    [InlineData(CardStatus.InProgress, CardPriority.Medium)]
    [InlineData(CardStatus.Done, CardPriority.High)]
    [InlineData(CardStatus.Done, CardPriority.Critical)]
    public async Task Handle_WithDifferentStatusesAndPriorities_ReturnsCorrectCards(CardStatus status, CardPriority priority)
    {
        // Arrange
        var listId = Guid.NewGuid();
        
        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Status Priority Test Card",
            Status = status,
            Priority = priority,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = listId
        };

        var cards = new List<Card> { card };
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(1);

        var cardDto = cardList.First();
        cardDto.Status.Should().Be(status);
        cardDto.Priority.Should().Be(priority);
    }

    [Fact]
    public async Task Handle_WithCardsWithAndWithoutDueDates_ReturnsCorrectDates()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var dueDate = DateTime.UtcNow.AddDays(7);

        var cardWithDueDate = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card With Due Date",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            DueDate = dueDate,
            Position = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = listId
        };

        var cardWithoutDueDate = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Without Due Date",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            DueDate = null,
            Position = 2,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ListId = listId
        };

        var cards = new List<Card> { cardWithDueDate, cardWithoutDueDate };
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
            .ReturnsAsync(cards);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var cardList = result.ToList();
        cardList.Should().HaveCount(2);

        var cardWithDueDateDto = cardList.First(c => c.Title == "Card With Due Date");
        cardWithDueDateDto.DueDate.Should().Be(dueDate);

        var cardWithoutDueDateDto = cardList.First(c => c.Title == "Card Without Due Date");
        cardWithoutDueDateDto.DueDate.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var query = new GetCardsByListQuery(listId);

        _cardRepositoryMock
            .Setup(x => x.GetByListIdAsync(listId))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }
}