using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Boards.Commands;
using TaskManager.Application.Boards.Handlers;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Boards.Handlers;

public class CreateBoardCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IBoardRepository> _boardRepositoryMock;
    private readonly Mock<IBoardMemberRepository> _boardMemberRepositoryMock;
    private readonly Mock<IJoinCodeService> _joinCodeServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateBoardCommandHandler _handler;

    public CreateBoardCommandHandlerTests()
    {
        _fixture = new Fixture();
        _boardRepositoryMock = new Mock<IBoardRepository>();
        _boardMemberRepositoryMock = new Mock<IBoardMemberRepository>();
        _joinCodeServiceMock = new Mock<IJoinCodeService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        
        _handler = new CreateBoardCommandHandler(
            _boardRepositoryMock.Object,
            _boardMemberRepositoryMock.Object,
            _joinCodeServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsCreateBoardResult()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };
        var joinCode = "ABC123";

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns(joinCode);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBe(Guid.Empty);
        result.Name.Should().Be(command.Name);
        result.Description.Should().Be(command.Description);
        result.JoinCode.Should().Be(joinCode);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        _joinCodeServiceMock.Verify(x => x.GenerateUniqueCode(), Times.Once);
        _boardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Board>()), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithValidRequest_CreatesBoardWithCorrectProperties()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };
        var joinCode = "ABC123";
        Board? capturedBoard = null;

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns(joinCode);

        _boardRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Board>()))
            .Callback<Board>(board => capturedBoard = board);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedBoard.Should().NotBeNull();
        capturedBoard!.Id.Should().NotBe(Guid.Empty);
        capturedBoard.Name.Should().Be(command.Name);
        capturedBoard.Description.Should().Be(command.Description);
        capturedBoard.JoinCode.Should().Be(joinCode);
        capturedBoard.OwnerId.Should().Be(command.UserId);
        capturedBoard.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        capturedBoard.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_WithValidRequest_CreatesOwnerMemberWithCorrectProperties()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };
        var joinCode = "ABC123";
        BoardMember? capturedMember = null;

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns(joinCode);

        _boardMemberRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<BoardMember>()))
            .Callback<BoardMember>(member => capturedMember = member);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedMember.Should().NotBeNull();
        capturedMember!.Id.Should().NotBe(Guid.Empty);
        capturedMember.BoardId.Should().NotBe(Guid.Empty);
        capturedMember.UserId.Should().Be(command.UserId);
        capturedMember.Role.Should().Be(BoardRole.Admin);
        capturedMember.JoinedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_WithValidRequest_OwnerMemberBoardIdMatchesBoardId()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };
        var joinCode = "ABC123";
        Board? capturedBoard = null;
        BoardMember? capturedMember = null;

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns(joinCode);

        _boardRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Board>()))
            .Callback<Board>(board => capturedBoard = board);

        _boardMemberRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<BoardMember>()))
            .Callback<BoardMember>(member => capturedMember = member);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedBoard.Should().NotBeNull();
        capturedMember.Should().NotBeNull();
        capturedMember!.BoardId.Should().Be(capturedBoard!.Id);
    }

    [Theory]
    [InlineData("", "")]
    [InlineData("Board Name", "")]
    [InlineData("", "Board Description")]
    [InlineData("Long Board Name With Many Characters", "Very detailed board description that explains the purpose")]
    public async Task Handle_WithVariousStringInputs_CreatesBoard(string name, string description)
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = name,
            Description = description,
            UserId = Guid.NewGuid()
        };
        var joinCode = "ABC123";

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns(joinCode);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(name);
        result.Description.Should().Be(description);
        _boardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Board>()), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenJoinCodeServiceThrows_PropagatesException()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Throws(new Exception("Join code generation error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Join code generation error");

        _boardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Board>()), Times.Never);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenBoardRepositoryThrows_PropagatesException()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns("ABC123");

        _boardRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Board>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");

        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUnitOfWorkSaveThrows_PropagatesException()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.NewGuid()
        };

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns("ABC123");

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Save changes error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Save changes error");

        _boardRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Board>()), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyUserId_StillCreatesBoard()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Project Board",
            Description = "A board for managing project tasks",
            UserId = Guid.Empty
        };
        var joinCode = "ABC123";

        _joinCodeServiceMock
            .Setup(x => x.GenerateUniqueCode())
            .Returns(joinCode);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        _boardRepositoryMock.Verify(x => x.AddAsync(It.Is<Board>(b => b.OwnerId == Guid.Empty)), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.Is<BoardMember>(m => m.UserId == Guid.Empty)), Times.Once);
    }
}