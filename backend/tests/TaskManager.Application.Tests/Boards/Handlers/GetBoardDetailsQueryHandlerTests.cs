using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Boards.Handlers;
using TaskManager.Application.Boards.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Boards.Handlers;

public class GetBoardDetailsQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IBoardRepository> _boardRepositoryMock;
    private readonly Mock<IBoardMemberRepository> _boardMemberRepositoryMock;
    private readonly GetBoardDetailsQueryHandler _handler;

    public GetBoardDetailsQueryHandlerTests()
    {
        _fixture = new Fixture();
        _boardRepositoryMock = new Mock<IBoardRepository>();
        _boardMemberRepositoryMock = new Mock<IBoardMemberRepository>();
        
        _handler = new GetBoardDetailsQueryHandler(
            _boardRepositoryMock.Object,
            _boardMemberRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidBoardAndMember_ReturnsBoardDetails()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };
        
        var userMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            UserId = userId,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            Description = "Test Description",
            JoinCode = "ABC123",
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember>
            {
                userMembership,
                new BoardMember
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.NewGuid(),
                    Role = BoardRole.Member,
                    JoinedAt = DateTime.UtcNow.AddDays(-1),
                    User = new User { Name = "Other User" }
                }
            }
        };

        // Set up the User navigation property
        userMembership.User = new User { Name = "Test User" };
        board.Members.First().User = new User { Name = "Test User" };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync(userMembership);

        _boardRepositoryMock
            .Setup(x => x.GetByIdAsync(boardId))
            .ReturnsAsync(board);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(board.Id);
        result.Name.Should().Be(board.Name);
        result.Description.Should().Be(board.Description);
        result.JoinCode.Should().Be(board.JoinCode);
        result.OwnerId.Should().Be(board.OwnerId);
        result.CreatedAt.Should().Be(board.CreatedAt);
        result.UserRole.Should().Be(userMembership.Role);
        result.Members.Should().HaveCount(2);
        
        _boardMemberRepositoryMock.Verify(x => x.GetByBoardAndUserAsync(boardId, userId), Times.Once);
        _boardRepositoryMock.Verify(x => x.GetByIdAsync(boardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonMemberUser_ReturnsNull()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync((BoardMember?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        
        _boardMemberRepositoryMock.Verify(x => x.GetByBoardAndUserAsync(boardId, userId), Times.Once);
        _boardRepositoryMock.Verify(x => x.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithValidMemberButNonExistentBoard_ReturnsNull()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };
        
        var userMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            UserId = userId,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync(userMembership);

        _boardRepositoryMock
            .Setup(x => x.GetByIdAsync(boardId))
            .ReturnsAsync((Board?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        
        _boardMemberRepositoryMock.Verify(x => x.GetByBoardAndUserAsync(boardId, userId), Times.Once);
        _boardRepositoryMock.Verify(x => x.GetByIdAsync(boardId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithMemberRole_ReturnsMemberRole()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };
        
        var userMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            UserId = userId,
            Role = BoardRole.Member,
            JoinedAt = DateTime.UtcNow,
            User = new User { Name = "Test User" }
        };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            Description = "Test Description",
            JoinCode = "ABC123",
            OwnerId = Guid.NewGuid(), // Different from userId
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember> { userMembership }
        };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync(userMembership);

        _boardRepositoryMock
            .Setup(x => x.GetByIdAsync(boardId))
            .ReturnsAsync(board);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.UserRole.Should().Be(BoardRole.Member);
    }

    [Fact]
    public async Task Handle_WithEmptyMembers_ReturnsEmptyMembersList()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };
        
        var userMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            UserId = userId,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        var board = new Board
        {
            Id = boardId,
            Name = "Test Board",
            Description = "Test Description",
            JoinCode = "ABC123",
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember>() // Empty members list
        };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync(userMembership);

        _boardRepositoryMock
            .Setup(x => x.GetByIdAsync(boardId))
            .ReturnsAsync(board);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Members.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenBoardMemberRepositoryThrows_PropagatesException()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }

    [Fact]
    public async Task Handle_WhenBoardRepositoryThrows_PropagatesException()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var query = new GetBoardDetailsQuery { BoardId = boardId, UserId = userId };
        
        var userMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            UserId = userId,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByBoardAndUserAsync(boardId, userId))
            .ReturnsAsync(userMembership);

        _boardRepositoryMock
            .Setup(x => x.GetByIdAsync(boardId))
            .ThrowsAsync(new Exception("Board fetch error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Board fetch error");
    }
}