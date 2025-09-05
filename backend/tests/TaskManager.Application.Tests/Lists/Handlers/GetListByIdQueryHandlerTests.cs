using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Handlers;
using TaskManager.Application.Lists.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Lists.Handlers;

public class GetListByIdQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IListRepository> _listRepositoryMock;
    private readonly GetListByIdQueryHandler _handler;

    public GetListByIdQueryHandlerTests()
    {
        _fixture = new Fixture();
        _listRepositoryMock = new Mock<IListRepository>();
        _handler = new GetListByIdQueryHandler(_listRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingList_ReturnsListDto()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();
        var user1 = new User { Id = Guid.NewGuid(), Name = "User 1", PasswordHash = "hash" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "User 2", PasswordHash = "hash" };

        var card1 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 1",
            Description = "Description 1",
            Status = CardStatus.Todo,
            Position = 1,
            AssigneeId = user1.Id,
            Assignee = user1,
            ListId = listId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var card2 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 2",
            Description = "Description 2",
            Status = CardStatus.InProgress,
            Position = 2,
            AssigneeId = user2.Id,
            Assignee = user2,
            ListId = listId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var card3 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card 3",
            Description = "Description 3",
            Status = CardStatus.Done,
            Position = 3,
            AssigneeId = null,
            Assignee = null,
            ListId = listId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var list = new List
        {
            Id = listId,
            Name = "Test List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card> { card1, card2, card3 }
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(listId);
        result.Name.Should().Be("Test List");
        result.Position.Should().Be(1);
        result.Cards.Should().HaveCount(3);

        var card1Dto = result.Cards.First(c => c.Id == card1.Id);
        card1Dto.Title.Should().Be("Card 1");
        card1Dto.Description.Should().Be("Description 1");
        card1Dto.Status.Should().Be(CardStatus.Todo);
        card1Dto.Position.Should().Be(1);
        card1Dto.AssigneeId.Should().Be(user1.Id);
        card1Dto.ListId.Should().Be(listId);
        card1Dto.Assignee.Should().NotBeNull();
        card1Dto.Assignee!.Id.Should().Be(user1.Id);
        card1Dto.Assignee.Name.Should().Be("User 1");

        var card2Dto = result.Cards.First(c => c.Id == card2.Id);
        card2Dto.Title.Should().Be("Card 2");
        card2Dto.Status.Should().Be(CardStatus.InProgress);
        card2Dto.Position.Should().Be(2);
        card2Dto.Assignee!.Name.Should().Be("User 2");

        var card3Dto = result.Cards.First(c => c.Id == card3.Id);
        card3Dto.Title.Should().Be("Card 3");
        card3Dto.Status.Should().Be(CardStatus.Done);
        card3Dto.Position.Should().Be(3);
        card3Dto.AssigneeId.Should().BeNull();
        card3Dto.Assignee.Should().BeNull();

        _listRepositoryMock.Verify(x => x.GetByIdWithCardsAsync(listId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyList_ReturnsListDtoWithNoCards()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();

        var list = new List
        {
            Id = listId,
            Name = "Empty List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>()
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(listId);
        result.Name.Should().Be("Empty List");
        result.Position.Should().Be(1);
        result.Cards.Should().BeEmpty();

        _listRepositoryMock.Verify(x => x.GetByIdWithCardsAsync(listId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentList_ReturnsNull()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync((List?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();

        _listRepositoryMock.Verify(x => x.GetByIdWithCardsAsync(listId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCardsWithoutAssignees_ReturnsCardsWithNullAssignees()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();

        var card1 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Unassigned Card 1",
            Status = CardStatus.Todo,
            Position = 1,
            AssigneeId = null,
            Assignee = null,
            ListId = listId
        };

        var card2 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Unassigned Card 2",
            Status = CardStatus.InProgress,
            Position = 2,
            AssigneeId = null,
            Assignee = null,
            ListId = listId
        };

        var list = new List
        {
            Id = listId,
            Name = "List With Unassigned Cards",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card> { card1, card2 }
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Cards.Should().HaveCount(2);

        result.Cards.Should().AllSatisfy(card =>
        {
            card.AssigneeId.Should().BeNull();
            card.Assignee.Should().BeNull();
        });
    }

    [Fact]
    public async Task Handle_WithSingleCard_ReturnsSingleCardInList()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();
        var user = new User { Id = Guid.NewGuid(), Name = "Test User", PasswordHash = "hash" };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Single Card",
            Description = "Only card in list",
            Status = CardStatus.InProgress,
            Position = 1,
            AssigneeId = user.Id,
            Assignee = user,
            ListId = listId
        };

        var list = new List
        {
            Id = listId,
            Name = "Single Card List",
            Position = 2,
            BoardId = boardId,
            Cards = new List<Card> { card }
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(listId);
        result.Name.Should().Be("Single Card List");
        result.Position.Should().Be(2);
        result.Cards.Should().HaveCount(1);

        var cardDto = result.Cards.First();
        cardDto.Id.Should().Be(card.Id);
        cardDto.Title.Should().Be("Single Card");
        cardDto.Description.Should().Be("Only card in list");
        cardDto.Status.Should().Be(CardStatus.InProgress);
        cardDto.Position.Should().Be(1);
        cardDto.AssigneeId.Should().Be(user.Id);
        cardDto.ListId.Should().Be(listId);
        cardDto.Assignee.Should().NotBeNull();
        cardDto.Assignee!.Id.Should().Be(user.Id);
        cardDto.Assignee.Name.Should().Be("Test User");
    }

    [Theory]
    [InlineData("To Do", 1)]
    [InlineData("In Progress", 2)]
    [InlineData("Done", 3)]
    [InlineData("Done", 10)]
    public async Task Handle_WithDifferentListNamesAndPositions_ReturnsCorrectListData(string listName, int position)
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();

        var list = new List
        {
            Id = listId,
            Name = listName,
            Position = position,
            BoardId = boardId,
            Cards = new List<Card>()
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be(listName);
        result.Position.Should().Be(position);
    }

    [Theory]
    [InlineData(CardStatus.Todo)]
    [InlineData(CardStatus.InProgress)]
    [InlineData(CardStatus.Done)]
    public async Task Handle_WithCardsOfDifferentStatuses_ReturnsCardsWithCorrectStatuses(CardStatus status)
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Status Test Card",
            Status = status,
            Position = 1,
            ListId = listId
        };

        var list = new List
        {
            Id = listId,
            Name = "Status Test List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card> { card }
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Cards.Should().HaveCount(1);
        result.Cards.First().Status.Should().Be(status);
    }

    [Fact]
    public async Task Handle_WithCardsInDifferentPositions_ReturnsCardsInCorrectOrder()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var boardId = Guid.NewGuid();

        var card1 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Position 3",
            Status = CardStatus.Todo,
            Position = 3,
            ListId = listId
        };

        var card2 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Position 1",
            Status = CardStatus.Todo,
            Position = 1,
            ListId = listId
        };

        var card3 = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Card Position 2",
            Status = CardStatus.Todo,
            Position = 2,
            ListId = listId
        };

        var list = new List
        {
            Id = listId,
            Name = "Position Test List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card> { card1, card2, card3 } // Not in position order
        };

        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ReturnsAsync(list);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Cards.Should().HaveCount(3);

        var cards = result.Cards.ToList();
        cards[0].Position.Should().Be(3); // Cards are returned as-is from repository
        cards[1].Position.Should().Be(1); // Repository is responsible for ordering
        cards[2].Position.Should().Be(2);
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var query = new GetListByIdQuery(listId);

        _listRepositoryMock
            .Setup(x => x.GetByIdWithCardsAsync(listId))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }
}