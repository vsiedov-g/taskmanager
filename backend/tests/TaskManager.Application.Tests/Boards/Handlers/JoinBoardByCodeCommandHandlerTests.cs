using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Boards.Commands;
using TaskManager.Application.Boards.Handlers;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Boards.Handlers;

public class JoinBoardByCodeCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IBoardRepository> _boardRepositoryMock;
    private readonly Mock<IBoardMemberRepository> _boardMemberRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly JoinBoardByCodeCommandHandler _handler;

    public JoinBoardByCodeCommandHandlerTests()
    {
        _fixture = new Fixture();
        _boardRepositoryMock = new Mock<IBoardRepository>();
        _boardMemberRepositoryMock = new Mock<IBoardMemberRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        
        _handler = new JoinBoardByCodeCommandHandler(
            _boardRepositoryMock.Object,
            _boardMemberRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidJoinCode_ReturnsSuccessResult()
    {
        // Arrange
        var joinCode = "ABC123";
        var userId = Guid.NewGuid();
        var boardId = Guid.NewGuid();
        var command = new JoinBoardByCodeCommand { JoinCode = joinCode, UserId = userId };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            JoinCode = joinCode
        };

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(joinCode))
            .ReturnsAsync(board);

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync((BoardMember?)null);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Message.Should().Be("Successfully joined board");
        result.BoardId.Should().Be(boardId);

        _boardRepositoryMock.Verify(x => x.GetByJoinCodeAsync(joinCode), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.GetByBoardAndUserAsync(boardId, userId), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidJoinCode_ReturnsFailureResult()
    {
        // Arrange
        var joinCode = "INVALID";
        var userId = Guid.NewGuid();
        var command = new JoinBoardByCodeCommand { JoinCode = joinCode, UserId = userId };

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(joinCode))
            .ReturnsAsync((Board?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid join code");
        result.BoardId.Should().BeNull();

        _boardRepositoryMock.Verify(x => x.GetByJoinCodeAsync(joinCode), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.GetByBoardAndUserAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithExistingMember_ReturnsAlreadyMemberResult()
    {
        // Arrange
        var joinCode = "ABC123";
        var userId = Guid.NewGuid();
        var boardId = Guid.NewGuid();
        var command = new JoinBoardByCodeCommand { JoinCode = joinCode, UserId = userId };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            JoinCode = joinCode
        };

        var existingMember = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            UserId = userId,
            Role = BoardRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(joinCode))
            .ReturnsAsync(board);

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync(existingMember);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Be("You are already a member of this board");
        result.BoardId.Should().Be(boardId);

        _boardRepositoryMock.Verify(x => x.GetByJoinCodeAsync(joinCode), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.GetByBoardAndUserAsync(boardId, userId), Times.Once);
        _boardMemberRepositoryMock.Verify(x => x.AddAsync(It.IsAny<BoardMember>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithValidJoinCode_CreatesCorrectBoardMember()
    {
        // Arrange
        var joinCode = "ABC123";
        var userId = Guid.NewGuid();
        var boardId = Guid.NewGuid();
        var command = new JoinBoardByCodeCommand { JoinCode = joinCode, UserId = userId };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            JoinCode = joinCode
        };

        BoardMember? capturedMember = null;

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(joinCode))
            .ReturnsAsync(board);

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync((BoardMember?)null);

        _boardMemberRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<BoardMember>()))
            .Callback<BoardMember>(member => capturedMember = member);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedMember.Should().NotBeNull();
        capturedMember!.Id.Should().NotBe(Guid.Empty);
        capturedMember.BoardId.Should().Be(boardId);
        capturedMember.UserId.Should().Be(userId);
        capturedMember.Role.Should().Be(BoardRole.Member);
        capturedMember.JoinedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Theory]
    [InlineData("")]
    [InlineData("ABC")]
    [InlineData("VERYLONGCODE123456789")]
    public async Task Handle_WithVariousJoinCodes_ProcessesCorrectly(string joinCode)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new JoinBoardByCodeCommand { JoinCode = joinCode, UserId = userId };

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(joinCode))
            .ReturnsAsync((Board?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid join code");
        _boardRepositoryMock.Verify(x => x.GetByJoinCodeAsync(joinCode), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenBoardRepositoryThrows_PropagatesException()
    {
        // Arrange
        var command = new JoinBoardByCodeCommand { JoinCode = "ABC123", UserId = Guid.NewGuid() };

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(It.IsAny<string>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }

    [Fact]
    public async Task Handle_WhenUnitOfWorkThrows_PropagatesException()
    {
        // Arrange
        var joinCode = "ABC123";
        var userId = Guid.NewGuid();
        var boardId = Guid.NewGuid();
        var command = new JoinBoardByCodeCommand { JoinCode = joinCode, UserId = userId };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            JoinCode = joinCode
        };

        _boardRepositoryMock
            .Setup(x => x.GetByJoinCodeAsync(joinCode))
            .ReturnsAsync(board);

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync((BoardMember?)null);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Save failed"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Save failed");
    }
}