using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Cards.Commands;
using TaskManager.Application.Cards.Handlers;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Cards.Handlers;

public class CreateCardCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<ICardRepository> _cardRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IActivityLogService> _activityLogServiceMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly CreateCardCommandHandler _handler;

    public CreateCardCommandHandlerTests()
    {
        _fixture = new Fixture();
        _cardRepositoryMock = new Mock<ICardRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _activityLogServiceMock = new Mock<IActivityLogService>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        
        _handler = new CreateCardCommandHandler(
            _cardRepositoryMock.Object,
            _userRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _activityLogServiceMock.Object,
            _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsCardDto()
    {
        // Arrange
        var command = new CreateCardCommand(
            "Test Card",
            "Test Description",
            CardStatus.Todo,
            CardPriority.Medium,
            DateTime.UtcNow.AddDays(7),
            1,
            null,
            Guid.NewGuid(),
            Guid.NewGuid());

        var currentUserId = Guid.NewGuid();

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(currentUserId);

        _activityLogServiceMock
            .Setup(x => x.LogCardCreatedAsync(It.IsAny<Card>(), currentUserId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(command.Title);
        result.Description.Should().Be(command.Description);
        result.Status.Should().Be(command.Status);
        result.Priority.Should().Be(command.Priority);
        result.DueDate.Should().BeCloseTo(command.DueDate!.Value, TimeSpan.FromSeconds(1));
        result.Position.Should().Be(command.Position);
        result.AssigneeId.Should().Be(command.AssigneeId);
        result.ListId.Should().Be(command.ListId);
        result.ProjectId.Should().Be(command.ProjectId);
        result.Id.Should().NotBe(Guid.Empty);

        _cardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Card>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
        _activityLogServiceMock.Verify(x => x.LogCardCreatedAsync(It.IsAny<Card>(), currentUserId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithValidAssignee_ValidatesAndCreatesCard()
    {
        // Arrange
        var assigneeId = Guid.NewGuid();
        var command = new CreateCardCommand(
            "Test Card",
            "Test Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            assigneeId,
            Guid.NewGuid(),
            null);

        var assignee = new User
        {
            Id = assigneeId,
            Name = "John Doe",
            PasswordHash = "hash"
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(assigneeId))
            .ReturnsAsync(assignee);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AssigneeId.Should().Be(assigneeId);
        _userRepositoryMock.Verify(x => x.GetByIdAsync(assigneeId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidAssignee_ThrowsArgumentException()
    {
        // Arrange
        var assigneeId = Guid.NewGuid();
        var command = new CreateCardCommand(
            "Test Card",
            "Test Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            assigneeId,
            Guid.NewGuid(),
            null);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(assigneeId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage($"User with ID {assigneeId} not found. (Parameter 'AssigneeId')");

        _userRepositoryMock.Verify(x => x.GetByIdAsync(assigneeId), Times.Once);
        _cardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Card>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithNullAssignee_DoesNotValidateAssignee()
    {
        // Arrange
        var command = new CreateCardCommand(
            "Test Card",
            "Test Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            null,
            Guid.NewGuid(),
            null);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AssigneeId.Should().BeNull();
        _userRepositoryMock.Verify(x => x.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
        _cardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Card>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithValidRequest_CreatesCardWithCorrectProperties()
    {
        // Arrange
        var dueDate = DateTime.UtcNow.AddDays(7);
        var command = new CreateCardCommand(
            "Test Card",
            "Test Description",
            CardStatus.InProgress,
            CardPriority.High,
            dueDate,
            5,
            null,
            Guid.NewGuid(),
            Guid.NewGuid());

        Card? capturedCard = null;

        _cardRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Card>()))
            .Callback<Card>(card => capturedCard = card);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(Guid.NewGuid());

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedCard.Should().NotBeNull();
        capturedCard!.Id.Should().NotBe(Guid.Empty);
        capturedCard.Title.Should().Be(command.Title);
        capturedCard.Description.Should().Be(command.Description);
        capturedCard.Status.Should().Be(command.Status);
        capturedCard.Priority.Should().Be(command.Priority);
        capturedCard.DueDate.Should().BeCloseTo(dueDate.ToUniversalTime(), TimeSpan.FromSeconds(1));
        capturedCard.Position.Should().Be(command.Position);
        capturedCard.ListId.Should().Be(command.ListId);
        capturedCard.ProjectId.Should().Be(command.ProjectId);
        capturedCard.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        capturedCard.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_WithValidRequest_LogsActivity()
    {
        // Arrange
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            null,
            Guid.NewGuid(),
            null);

        var currentUserId = Guid.NewGuid();
        Card? loggedCard = null;
        Guid? loggedUserId = null;

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(currentUserId);

        _activityLogServiceMock
            .Setup(x => x.LogCardCreatedAsync(It.IsAny<Card>(), It.IsAny<Guid>()))
            .Callback<Card, Guid>((card, userId) => 
            {
                loggedCard = card;
                loggedUserId = userId;
            })
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        loggedCard.Should().NotBeNull();
        loggedUserId.Should().Be(currentUserId);
        loggedCard!.Title.Should().Be(command.Title);
    }

    [Theory]
    [InlineData("", "")]
    [InlineData("Card", "")]
    [InlineData("", "Description")]
    [InlineData("Very Long Title", "Very detailed description with lots of content")]
    public async Task Handle_WithVariousStringInputs_CreatesCard(string title, string description)
    {
        // Arrange
        var command = new CreateCardCommand(
            title,
            description,
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            null,
            Guid.NewGuid(),
            null);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(title);
        result.Description.Should().Be(description);
        _cardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Card>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCardRepositoryThrows_PropagatesException()
    {
        // Arrange
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            null,
            Guid.NewGuid(),
            null);

        _cardRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Card>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }

    [Fact]
    public async Task Handle_WhenActivityLogServiceThrows_PropagatesException()
    {
        // Arrange
        var command = new CreateCardCommand(
            "Test Card",
            "Description",
            CardStatus.Todo,
            CardPriority.Medium,
            null,
            1,
            null,
            Guid.NewGuid(),
            null);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _currentUserServiceMock
            .Setup(x => x.GetCurrentUserId())
            .Returns(Guid.NewGuid());

        _activityLogServiceMock
            .Setup(x => x.LogCardCreatedAsync(It.IsAny<Card>(), It.IsAny<Guid>()))
            .ThrowsAsync(new Exception("Activity log error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Activity log error");
    }
}