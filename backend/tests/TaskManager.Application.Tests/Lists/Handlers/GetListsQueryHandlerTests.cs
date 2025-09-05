using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Handlers;
using TaskManager.Application.Lists.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Lists.Handlers;

public class GetListsQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IListRepository> _listRepositoryMock;
    private readonly GetListsQueryHandler _handler;

    public GetListsQueryHandlerTests()
    {
        _fixture = new Fixture();
        _listRepositoryMock = new Mock<IListRepository>();
        _handler = new GetListsQueryHandler(_listRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithMultipleLists_ReturnsAllListsWithCards()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var user1 = new User { Id = Guid.NewGuid(), Name = "User 1", PasswordHash = "hash" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "User 2", PasswordHash = "hash" };

        // List 1 with cards
        var list1 = new List
        {
            Id = Guid.NewGuid(),
            Name = "To Do",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Card 1",
                    Description = "Description 1",
                    Status = CardStatus.Todo,
                    Position = 1,
                    AssigneeId = user1.Id,
                    Assignee = user1,
                    ListId = Guid.NewGuid()
                },
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Card 2",
                    Description = "Description 2",
                    Status = CardStatus.Todo,
                    Position = 2,
                    AssigneeId = null,
                    Assignee = null,
                    ListId = Guid.NewGuid()
                }
            }
        };

        // List 2 with cards
        var list2 = new List
        {
            Id = Guid.NewGuid(),
            Name = "In Progress",
            Position = 2,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Card 3",
                    Description = "Description 3",
                    Status = CardStatus.InProgress,
                    Position = 1,
                    AssigneeId = user2.Id,
                    Assignee = user2,
                    ListId = Guid.NewGuid()
                }
            }
        };

        // List 3 empty
        var list3 = new List
        {
            Id = Guid.NewGuid(),
            Name = "Done",
            Position = 3,
            BoardId = boardId,
            Cards = new List<Card>()
        };

        var lists = new List<List> { list1, list2, list3 };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(3);

        var list1Dto = listDtos.First(l => l.Name == "To Do");
        list1Dto.Id.Should().Be(list1.Id);
        list1Dto.Position.Should().Be(1);
        list1Dto.Cards.Should().HaveCount(2);

        var card1Dto = list1Dto.Cards.First(c => c.Title == "Card 1");
        card1Dto.Description.Should().Be("Description 1");
        card1Dto.Status.Should().Be(CardStatus.Todo);
        card1Dto.Position.Should().Be(1);
        card1Dto.AssigneeId.Should().Be(user1.Id);
        card1Dto.Assignee.Should().NotBeNull();
        card1Dto.Assignee!.Id.Should().Be(user1.Id);
        card1Dto.Assignee.Name.Should().Be("User 1");

        var card2Dto = list1Dto.Cards.First(c => c.Title == "Card 2");
        card2Dto.Description.Should().Be("Description 2");
        card2Dto.Status.Should().Be(CardStatus.Todo);
        card2Dto.Position.Should().Be(2);
        card2Dto.AssigneeId.Should().BeNull();
        card2Dto.Assignee.Should().BeNull();

        var list2Dto = listDtos.First(l => l.Name == "In Progress");
        list2Dto.Id.Should().Be(list2.Id);
        list2Dto.Position.Should().Be(2);
        list2Dto.Cards.Should().HaveCount(1);

        var card3Dto = list2Dto.Cards.First();
        card3Dto.Title.Should().Be("Card 3");
        card3Dto.Status.Should().Be(CardStatus.InProgress);
        card3Dto.AssigneeId.Should().Be(user2.Id);
        card3Dto.Assignee!.Name.Should().Be("User 2");

        var list3Dto = listDtos.First(l => l.Name == "Done");
        list3Dto.Id.Should().Be(list3.Id);
        list3Dto.Position.Should().Be(3);
        list3Dto.Cards.Should().BeEmpty();

        _listRepositoryMock.Verify(x => x.GetAllWithCardsByBoardIdAsync(boardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyBoard_ReturnsEmptyCollection()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(new List<List>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();

        _listRepositoryMock.Verify(x => x.GetAllWithCardsByBoardIdAsync(boardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithListsWithoutCards_ReturnsListsWithEmptyCardCollections()
    {
        // Arrange
        var boardId = Guid.NewGuid();

        var list1 = new List
        {
            Id = Guid.NewGuid(),
            Name = "Empty List 1",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>()
        };

        var list2 = new List
        {
            Id = Guid.NewGuid(),
            Name = "Empty List 2",
            Position = 2,
            BoardId = boardId,
            Cards = new List<Card>()
        };

        var lists = new List<List> { list1, list2 };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(2);

        listDtos.Should().AllSatisfy(list =>
        {
            list.Cards.Should().BeEmpty();
        });

        var list1Dto = listDtos.First(l => l.Name == "Empty List 1");
        list1Dto.Position.Should().Be(1);

        var list2Dto = listDtos.First(l => l.Name == "Empty List 2");
        list2Dto.Position.Should().Be(2);
    }

    [Fact]
    public async Task Handle_WithSingleListAndCards_ReturnsSingleListWithCards()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var user = new User { Id = Guid.NewGuid(), Name = "Test User", PasswordHash = "hash" };

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = "Single List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Only Card",
                    Description = "Single card in single list",
                    Status = CardStatus.InProgress,
                    Position = 1,
                    AssigneeId = user.Id,
                    Assignee = user,
                    ListId = Guid.NewGuid()
                }
            }
        };

        var lists = new List<List> { list };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(1);

        var listDto = listDtos.First();
        listDto.Id.Should().Be(list.Id);
        listDto.Name.Should().Be("Single List");
        listDto.Position.Should().Be(1);
        listDto.Cards.Should().HaveCount(1);

        var cardDto = listDto.Cards.First();
        cardDto.Title.Should().Be("Only Card");
        cardDto.Description.Should().Be("Single card in single list");
        cardDto.Status.Should().Be(CardStatus.InProgress);
        cardDto.Position.Should().Be(1);
        cardDto.AssigneeId.Should().Be(user.Id);
        cardDto.Assignee.Should().NotBeNull();
        cardDto.Assignee!.Id.Should().Be(user.Id);
        cardDto.Assignee.Name.Should().Be("Test User");
    }

    [Fact]
    public async Task Handle_WithCardsWithoutAssignees_ReturnsCardsWithNullAssignees()
    {
        // Arrange
        var boardId = Guid.NewGuid();

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = "List With Unassigned Cards",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Unassigned Card 1",
                    Status = CardStatus.Todo,
                    Position = 1,
                    AssigneeId = null,
                    Assignee = null,
                    ListId = Guid.NewGuid()
                },
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Unassigned Card 2",
                    Status = CardStatus.InProgress,
                    Position = 2,
                    AssigneeId = null,
                    Assignee = null,
                    ListId = Guid.NewGuid()
                }
            }
        };

        var lists = new List<List> { list };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(1);

        var listDto = listDtos.First();
        listDto.Cards.Should().HaveCount(2);

        listDto.Cards.Should().AllSatisfy(card =>
        {
            card.AssigneeId.Should().BeNull();
            card.Assignee.Should().BeNull();
        });
    }

    [Theory]
    [InlineData("To Do", 1)]
    [InlineData("In Progress", 2)]
    [InlineData("Done", 3)]
    [InlineData("Done", 10)]
    public async Task Handle_WithDifferentListNamesAndPositions_ReturnsCorrectListData(string listName, int position)
    {
        // Arrange
        var boardId = Guid.NewGuid();

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = listName,
            Position = position,
            BoardId = boardId,
            Cards = new List<Card>()
        };

        var lists = new List<List> { list };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(1);

        var listDto = listDtos.First();
        listDto.Name.Should().Be(listName);
        listDto.Position.Should().Be(position);
    }

    [Theory]
    [InlineData(CardStatus.Todo)]
    [InlineData(CardStatus.InProgress)]
    [InlineData(CardStatus.Done)]
    public async Task Handle_WithCardsOfDifferentStatuses_ReturnsCardsWithCorrectStatuses(CardStatus status)
    {
        // Arrange
        var boardId = Guid.NewGuid();

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = "Status Test List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Status Test Card",
                    Status = status,
                    Position = 1,
                    ListId = Guid.NewGuid()
                }
            }
        };

        var lists = new List<List> { list };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(1);

        var listDto = listDtos.First();
        listDto.Cards.Should().HaveCount(1);
        listDto.Cards.First().Status.Should().Be(status);
    }

    [Fact]
    public async Task Handle_WithMixedAssignedAndUnassignedCards_ReturnsCorrectAssignmentData()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var assignedUser = new User { Id = Guid.NewGuid(), Name = "Assigned User", PasswordHash = "hash" };

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = "Mixed Assignment List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Assigned Card",
                    Status = CardStatus.InProgress,
                    Position = 1,
                    AssigneeId = assignedUser.Id,
                    Assignee = assignedUser,
                    ListId = Guid.NewGuid()
                },
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Unassigned Card",
                    Status = CardStatus.Todo,
                    Position = 2,
                    AssigneeId = null,
                    Assignee = null,
                    ListId = Guid.NewGuid()
                }
            }
        };

        var lists = new List<List> { list };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(1);

        var listDto = listDtos.First();
        listDto.Cards.Should().HaveCount(2);

        var assignedCard = listDto.Cards.First(c => c.Title == "Assigned Card");
        assignedCard.AssigneeId.Should().Be(assignedUser.Id);
        assignedCard.Assignee.Should().NotBeNull();
        assignedCard.Assignee!.Id.Should().Be(assignedUser.Id);
        assignedCard.Assignee.Name.Should().Be("Assigned User");

        var unassignedCard = listDto.Cards.First(c => c.Title == "Unassigned Card");
        unassignedCard.AssigneeId.Should().BeNull();
        unassignedCard.Assignee.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithCardsInDifferentPositions_ReturnsCardsAsFromRepository()
    {
        // Arrange  
        var boardId = Guid.NewGuid();

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = "Position Test List",
            Position = 1,
            BoardId = boardId,
            Cards = new List<Card>
            {
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Card Position 3",
                    Status = CardStatus.Todo,
                    Position = 3,
                    ListId = Guid.NewGuid()
                },
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Card Position 1",
                    Status = CardStatus.Todo,
                    Position = 1,
                    ListId = Guid.NewGuid()
                },
                new Card
                {
                    Id = Guid.NewGuid(),
                    Title = "Card Position 2",
                    Status = CardStatus.Todo,
                    Position = 2,
                    ListId = Guid.NewGuid()
                }
            }
        };

        var lists = new List<List> { list };
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ReturnsAsync(lists);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        var listDtos = result.ToList();
        listDtos.Should().HaveCount(1);

        var listDto = listDtos.First();
        listDto.Cards.Should().HaveCount(3);

        // Cards should maintain their original positions as returned from repository
        var cards = listDto.Cards.ToList();
        cards[0].Position.Should().Be(3);
        cards[1].Position.Should().Be(1);
        cards[2].Position.Should().Be(2);
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var query = new GetListsQuery(boardId);

        _listRepositoryMock
            .Setup(x => x.GetAllWithCardsByBoardIdAsync(boardId))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }
}