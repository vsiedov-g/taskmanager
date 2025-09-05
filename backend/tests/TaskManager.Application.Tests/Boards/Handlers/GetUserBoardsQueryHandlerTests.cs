using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Boards.Handlers;
using TaskManager.Application.Boards.Queries;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Boards.Handlers;

public class GetUserBoardsQueryHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IBoardMemberRepository> _boardMemberRepositoryMock;
    private readonly GetUserBoardsQueryHandler _handler;

    public GetUserBoardsQueryHandlerTests()
    {
        _fixture = new Fixture();
        _boardMemberRepositoryMock = new Mock<IBoardMemberRepository>();
        _handler = new GetUserBoardsQueryHandler(_boardMemberRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithUserMemberships_ReturnsUserBoards()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        
        var board1 = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Board 1",
            Description = "Description 1",
            JoinCode = "ABC123",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember>()
        };
        
        var board2 = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Board 2",
            Description = "Description 2",
            JoinCode = "DEF456",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            Members = new List<BoardMember>()
        };

        var membership1 = new BoardMember
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BoardId = board1.Id,
            Board = board1,
            Role = BoardRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        var membership2 = new BoardMember
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BoardId = board2.Id,
            Board = board2,
            Role = BoardRole.Member,
            JoinedAt = DateTime.UtcNow.AddDays(-1)
        };

        // Add members to boards for count
        board1.Members.Add(membership1);
        board1.Members.Add(new BoardMember { UserId = Guid.NewGuid(), BoardId = board1.Id, Role = BoardRole.Member });
        board2.Members.Add(membership2);

        var userMemberships = new List<BoardMember> { membership1, membership2 };

        var query = new GetUserBoardsQuery { UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByUserAsync(userId))
            .ReturnsAsync(userMemberships);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);

        var board1Dto = result.First(b => b.Id == board1.Id);
        board1Dto.Name.Should().Be("Board 1");
        board1Dto.Description.Should().Be("Description 1");
        board1Dto.JoinCode.Should().Be("ABC123");
        board1Dto.OwnerId.Should().Be(ownerId);
        board1Dto.MemberCount.Should().Be(2);
        board1Dto.UserRole.Should().Be(BoardRole.Admin);

        var board2Dto = result.First(b => b.Id == board2.Id);
        board2Dto.Name.Should().Be("Board 2");
        board2Dto.UserRole.Should().Be(BoardRole.Member);
        board2Dto.MemberCount.Should().Be(1);

        _boardMemberRepositoryMock.Verify(x => x.GetByUserAsync(userId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNoMemberships_ReturnsEmptyList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetUserBoardsQuery { UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByUserAsync(userId))
            .ReturnsAsync(new List<BoardMember>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();

        _boardMemberRepositoryMock.Verify(x => x.GetByUserAsync(userId), Times.Once);
    }

    [Fact]
    public async Task Handle_WithSingleMembership_ReturnsSingleBoard()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Single Board",
            Description = "Single Description",
            JoinCode = "XYZ789",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember>()
        };

        var membership = new BoardMember
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BoardId = board.Id,
            Board = board,
            Role = BoardRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        board.Members.Add(membership);

        var userMemberships = new List<BoardMember> { membership };
        var query = new GetUserBoardsQuery { UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByUserAsync(userId))
            .ReturnsAsync(userMemberships);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);

        var boardDto = result.First();
        boardDto.Id.Should().Be(board.Id);
        boardDto.Name.Should().Be("Single Board");
        boardDto.Description.Should().Be("Single Description");
        boardDto.JoinCode.Should().Be("XYZ789");
        boardDto.UserRole.Should().Be(BoardRole.Member);
        boardDto.MemberCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_WithDifferentUserRoles_ReturnsBoardsWithCorrectRoles()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        
        var adminBoard = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Admin Board",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember>()
        };
        
        var memberBoard = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Member Board",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            Members = new List<BoardMember>()
        };

        var adminMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Board = adminBoard,
            Role = BoardRole.Admin
        };

        var memberMembership = new BoardMember
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Board = memberBoard,
            Role = BoardRole.Member
        };

        adminBoard.Members.Add(adminMembership);
        memberBoard.Members.Add(memberMembership);

        var userMemberships = new List<BoardMember> { adminMembership, memberMembership };
        var query = new GetUserBoardsQuery { UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByUserAsync(userId))
            .ReturnsAsync(userMemberships);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);

        var adminBoardDto = result.First(b => b.Name == "Admin Board");
        adminBoardDto.UserRole.Should().Be(BoardRole.Admin);

        var memberBoardDto = result.First(b => b.Name == "Member Board");
        memberBoardDto.UserRole.Should().Be(BoardRole.Member);
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetUserBoardsQuery { UserId = userId };

        _boardMemberRepositoryMock
            .Setup(x => x.GetByUserAsync(userId))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }
}