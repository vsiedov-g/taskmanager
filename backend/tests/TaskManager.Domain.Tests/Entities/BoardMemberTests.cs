using AutoFixture;
using FluentAssertions;
using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Tests.Entities;

public class BoardMemberTests
{
    private readonly Fixture _fixture;

    public BoardMemberTests()
    {
        _fixture = new Fixture();
    }

    [Fact]
    public void BoardMember_Creation_SetsDefaultValues()
    {
        // Act
        var boardMember = new BoardMember();

        // Assert
        boardMember.Id.Should().Be(Guid.Empty);
        boardMember.BoardId.Should().Be(Guid.Empty);
        boardMember.UserId.Should().Be(Guid.Empty);
        boardMember.Role.Should().Be(BoardRole.Member);
        boardMember.JoinedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void BoardMember_SetValidProperties_Success()
    {
        // Arrange
        var boardMember = new BoardMember();
        var boardId = _fixture.Create<Guid>();
        var userId = _fixture.Create<Guid>();
        var joinedAt = DateTime.UtcNow.AddDays(-1);

        // Act
        boardMember.BoardId = boardId;
        boardMember.UserId = userId;
        boardMember.Role = BoardRole.Admin;
        boardMember.JoinedAt = joinedAt;

        // Assert
        boardMember.BoardId.Should().Be(boardId);
        boardMember.UserId.Should().Be(userId);
        boardMember.Role.Should().Be(BoardRole.Admin);
        boardMember.JoinedAt.Should().Be(joinedAt);
    }

    [Fact]
    public void BoardRole_AllEnumValues_AreValid()
    {
        // Arrange & Act
        var roleValues = Enum.GetValues<BoardRole>();

        // Assert
        roleValues.Should().Contain(BoardRole.Admin);
        roleValues.Should().Contain(BoardRole.Member);
        roleValues.Length.Should().Be(2);
    }

    [Fact]
    public void BoardRole_DefaultValue_IsMember()
    {
        // Arrange & Act
        var boardMember = new BoardMember();

        // Assert
        boardMember.Role.Should().Be(BoardRole.Member);
    }

    [Theory]
    [InlineData(BoardRole.Admin, 0)]
    [InlineData(BoardRole.Member, 1)]
    public void BoardRole_EnumValues_HaveCorrectIntegerValues(BoardRole role, int expectedValue)
    {
        // Assert
        ((int)role).Should().Be(expectedValue);
    }

    [Fact]
    public void BoardMember_NavigationProperties_InitializedCorrectly()
    {
        // Arrange & Act
        var boardMember = new BoardMember();

        // Assert
        boardMember.Board.Should().BeNull();
        boardMember.User.Should().BeNull();
    }

    [Fact]
    public void BoardMember_SetRoles_Success()
    {
        // Arrange
        var boardMember = new BoardMember();

        // Act & Assert
        boardMember.Role = BoardRole.Admin;
        boardMember.Role.Should().Be(BoardRole.Admin);

        boardMember.Role = BoardRole.Member;
        boardMember.Role.Should().Be(BoardRole.Member);
    }

    [Fact]
    public void BoardMember_DefaultId_IsEmpty()
    {
        // Arrange & Act
        var boardMember = new BoardMember();

        // Assert
        boardMember.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void BoardMember_TwoInstances_HaveSameDefaultIds()
    {
        // Arrange & Act
        var boardMember1 = new BoardMember();
        var boardMember2 = new BoardMember();

        // Assert
        boardMember1.Id.Should().Be(boardMember2.Id);
        boardMember1.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void BoardMember_WithValidData_IsValid()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var role = BoardRole.Admin;
        var joinedAt = DateTime.UtcNow.AddDays(-5);

        // Act
        var boardMember = new BoardMember
        {
            BoardId = boardId,
            UserId = userId,
            Role = role,
            JoinedAt = joinedAt
        };

        // Assert
        boardMember.BoardId.Should().Be(boardId);
        boardMember.UserId.Should().Be(userId);
        boardMember.Role.Should().Be(role);
        boardMember.JoinedAt.Should().Be(joinedAt);
        boardMember.Id.Should().Be(Guid.Empty); // Will be set by application layer
    }
}