using AutoFixture;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.API.Controllers;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Cards.Queries;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;

namespace TaskManager.API.Tests.Controllers;

public class CardsControllerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly CardsController _controller;

    public CardsControllerTests()
    {
        _fixture = new Fixture();
        _mediatorMock = new Mock<IMediator>();
        _controller = new CardsController(_mediatorMock.Object);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task GetCards_ReturnsOkWithCards()
    {
        // Arrange
        var expectedCards = new List<CardDto>
        {
            new CardDto
            {
                Id = Guid.NewGuid(),
                Title = "Card 1",
                Description = "Description 1",
                Status = CardStatus.Todo,
                Priority = CardPriority.High,
                Position = 1,
                ListId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            },
            new CardDto
            {
                Id = Guid.NewGuid(),
                Title = "Card 2",
                Description = "Description 2",
                Status = CardStatus.InProgress,
                Priority = CardPriority.Medium,
                Position = 2,
                ListId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetCardsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCards);

        // Act
        var result = await _controller.GetCards();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var cards = okResult.Value.Should().BeAssignableTo<List<CardDto>>().Subject;
        cards.Should().HaveCount(2);
        cards.Should().BeEquivalentTo(expectedCards);

        _mediatorMock.Verify(x => x.Send(
            It.IsAny<GetCardsQuery>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCard_WithExistingCard_ReturnsOkWithCard()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var expectedCard = new CardDto
        {
            Id = cardId,
            Title = "Test Card",
            Description = "Test Description",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            Position = 1,
            ListId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetCardByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCard);

        // Act
        var result = await _controller.GetCard(cardId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var card = okResult.Value.Should().BeAssignableTo<CardDto>().Subject;
        card.Should().BeEquivalentTo(expectedCard);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetCardByIdQuery>(q => q.Id == cardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCard_WithNonExistentCard_ReturnsNotFound()
    {
        // Arrange
        var cardId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetCardByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((CardDto?)null);

        // Act
        var result = await _controller.GetCard(cardId);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetCardsByList_ReturnsOkWithCards()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var expectedCards = new List<CardDto>
        {
            new CardDto
            {
                Id = Guid.NewGuid(),
                Title = "List Card 1",
                ListId = listId,
                Position = 1,
                Status = CardStatus.Todo,
                Priority = CardPriority.Low,
                CreatedAt = DateTime.UtcNow
            },
            new CardDto
            {
                Id = Guid.NewGuid(),
                Title = "List Card 2",
                ListId = listId,
                Position = 2,
                Status = CardStatus.InProgress,
                Priority = CardPriority.High,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetCardsByListQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCards);

        // Act
        var result = await _controller.GetCardsByList(listId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var cards = okResult.Value.Should().BeAssignableTo<List<CardDto>>().Subject;
        cards.Should().HaveCount(2);
        cards.Should().BeEquivalentTo(expectedCards);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetCardsByListQuery>(q => q.ListId == listId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateCard_WithValidRequest_ReturnsCreatedCard()
    {
        // Arrange
        var request = new CreateCardRequest
        {
            Title = "New Card",
            Description = "New Description",
            Status = CardStatus.Todo,
            Priority = CardPriority.High,
            DueDate = DateTime.UtcNow.AddDays(7),
            Position = 1,
            AssigneeId = Guid.NewGuid(),
            ListId = Guid.NewGuid(),
            ProjectId = Guid.NewGuid()
        };

        var expectedCard = new CardDto
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            Position = request.Position,
            AssigneeId = request.AssigneeId,
            ListId = request.ListId,
            ProjectId = request.ProjectId,
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCard);

        // Act
        var result = await _controller.CreateCard(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(CardsController.GetCard));
        createdResult.RouteValues.Should().ContainKey("id").WhoseValue.Should().Be(expectedCard.Id);

        var card = createdResult.Value.Should().BeAssignableTo<CardDto>().Subject;
        card.Should().BeEquivalentTo(expectedCard);

        _mediatorMock.Verify(x => x.Send(
            It.Is<CreateCardCommand>(c => 
                c.Title == request.Title &&
                c.Description == request.Description &&
                c.Status == request.Status &&
                c.Priority == request.Priority &&
                c.DueDate == request.DueDate &&
                c.Position == request.Position &&
                c.AssigneeId == request.AssigneeId &&
                c.ListId == request.ListId &&
                c.ProjectId == request.ProjectId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateCard_WithExistingCard_ReturnsUpdatedCard()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var request = new UpdateCardRequest
        {
            Title = "Updated Card",
            Description = "Updated Description",
            Status = CardStatus.InProgress,
            Priority = CardPriority.Low,
            DueDate = DateTime.UtcNow.AddDays(3),
            Position = 2,
            AssigneeId = Guid.NewGuid(),
            ListId = Guid.NewGuid(),
            ProjectId = Guid.NewGuid()
        };

        var expectedCard = new CardDto
        {
            Id = cardId,
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            Position = request.Position,
            AssigneeId = request.AssigneeId,
            ListId = request.ListId,
            ProjectId = request.ProjectId,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCard);

        // Act
        var result = await _controller.UpdateCard(cardId, request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var card = okResult.Value.Should().BeAssignableTo<CardDto>().Subject;
        card.Should().BeEquivalentTo(expectedCard);

        _mediatorMock.Verify(x => x.Send(
            It.Is<UpdateCardCommand>(c => 
                c.Id == cardId &&
                c.Title == request.Title &&
                c.Description == request.Description &&
                c.Status == request.Status &&
                c.Priority == request.Priority &&
                c.DueDate == request.DueDate &&
                c.Position == request.Position &&
                c.AssigneeId == request.AssigneeId &&
                c.ListId == request.ListId &&
                c.ProjectId == request.ProjectId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateCard_WithNonExistentCard_ReturnsNotFound()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var request = new UpdateCardRequest
        {
            Title = "Updated Card",
            Description = "Updated Description"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((CardDto?)null);

        // Act
        var result = await _controller.UpdateCard(cardId, request);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task MoveCard_WithExistingCard_ReturnsMovedCard()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var request = new MoveCardRequest
        {
            ListId = Guid.NewGuid(),
            Position = 3
        };

        var expectedCard = new CardDto
        {
            Id = cardId,
            Title = "Moved Card",
            ListId = request.ListId,
            Position = request.Position,
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<MoveCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCard);

        // Act
        var result = await _controller.MoveCard(cardId, request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var card = okResult.Value.Should().BeAssignableTo<CardDto>().Subject;
        card.Should().BeEquivalentTo(expectedCard);

        _mediatorMock.Verify(x => x.Send(
            It.Is<MoveCardCommand>(c => 
                c.Id == cardId &&
                c.ListId == request.ListId &&
                c.Position == request.Position),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task MoveCard_WithNonExistentCard_ReturnsNotFound()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var request = new MoveCardRequest
        {
            ListId = Guid.NewGuid(),
            Position = 1
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<MoveCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((CardDto?)null);

        // Act
        var result = await _controller.MoveCard(cardId, request);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteCard_WithExistingCard_ReturnsNoContent()
    {
        // Arrange
        var cardId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<DeleteCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteCard(cardId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();

        _mediatorMock.Verify(x => x.Send(
            It.Is<DeleteCardCommand>(c => c.Id == cardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteCard_WithNonExistentCard_ReturnsNotFound()
    {
        // Arrange
        var cardId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<DeleteCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteCard(cardId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NotFoundResult>();
    }

    [Theory]
    [InlineData("", "Valid Description", CardStatus.Todo, CardPriority.Medium)]
    [InlineData("Valid Title", "", CardStatus.InProgress, CardPriority.High)]
    [InlineData("Title", "Description", CardStatus.Done, CardPriority.Low)]
    public async Task CreateCard_WithVariousInputs_ProcessesCorrectly(string title, string description, CardStatus status, CardPriority priority)
    {
        // Arrange
        var request = new CreateCardRequest
        {
            Title = title,
            Description = description,
            Status = status,
            Priority = priority,
            Position = 1,
            ListId = Guid.NewGuid()
        };

        var expectedCard = new CardDto
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description,
            Status = status,
            Priority = priority,
            Position = 1,
            ListId = request.ListId,
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateCardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCard);

        // Act
        var result = await _controller.CreateCard(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var card = createdResult.Value.Should().BeAssignableTo<CardDto>().Subject;
        card.Title.Should().Be(title);
        card.Description.Should().Be(description);
        card.Status.Should().Be(status);
        card.Priority.Should().Be(priority);
    }

    [Fact]
    public async Task CreateCard_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var request = new CreateCardRequest
        {
            Title = "Test Card",
            Description = "Test Description",
            ListId = Guid.NewGuid()
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateCardCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Creation failed"));

        // Act & Assert
        var act = async () => await _controller.CreateCard(request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Creation failed");
    }

    [Fact]
    public async Task UpdateCard_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var request = new UpdateCardRequest
        {
            Title = "Updated Card",
            Description = "Updated Description"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateCardCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Update failed"));

        // Act & Assert
        var act = async () => await _controller.UpdateCard(cardId, request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Update failed");
    }
}