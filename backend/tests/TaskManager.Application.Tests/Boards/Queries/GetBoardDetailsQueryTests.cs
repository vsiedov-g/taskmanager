using FluentAssertions;
using TaskManager.Application.Boards.Queries;

namespace TaskManager.Application.Tests.Boards.Queries;

public class GetBoardDetailsQueryTests
{
    [Fact]
    public void GetBoardDetailsQuery_Creation_SetsProperties()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Act
        var query = new GetBoardDetailsQuery
        {
            BoardId = boardId,
            UserId = userId
        };

        // Assert
        query.BoardId.Should().Be(boardId);
        query.UserId.Should().Be(userId);
    }

    [Fact]
    public void GetBoardDetailsQuery_DefaultValues_AreCorrect()
    {
        // Act
        var query = new GetBoardDetailsQuery();

        // Assert
        query.BoardId.Should().Be(Guid.Empty);
        query.UserId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void BoardDetailsDto_Creation_SetsProperties()
    {
        // Arrange
        var id = Guid.NewGuid();
        var name = "Test Board";
        var description = "Test Description";
        var joinCode = "ABC123";
        var ownerId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var userRole = TaskManager.Domain.Entities.BoardRole.Admin;
        var members = new List<BoardMemberDto>();

        // Act
        var dto = new BoardDetailsDto
        {
            Id = id,
            Name = name,
            Description = description,
            JoinCode = joinCode,
            OwnerId = ownerId,
            CreatedAt = createdAt,
            UserRole = userRole,
            Members = members
        };

        // Assert
        dto.Id.Should().Be(id);
        dto.Name.Should().Be(name);
        dto.Description.Should().Be(description);
        dto.JoinCode.Should().Be(joinCode);
        dto.OwnerId.Should().Be(ownerId);
        dto.CreatedAt.Should().Be(createdAt);
        dto.UserRole.Should().Be(userRole);
        dto.Members.Should().BeSameAs(members);
    }

    [Fact]
    public void BoardDetailsDto_DefaultValues_AreCorrect()
    {
        // Act
        var dto = new BoardDetailsDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.Name.Should().BeEmpty();
        dto.Description.Should().BeEmpty();
        dto.JoinCode.Should().BeEmpty();
        dto.OwnerId.Should().Be(Guid.Empty);
        dto.CreatedAt.Should().Be(DateTime.MinValue);
        dto.UserRole.Should().Be(TaskManager.Domain.Entities.BoardRole.Admin);
        dto.Members.Should().NotBeNull();
        dto.Members.Should().BeEmpty();
    }

    [Fact]
    public void BoardMemberDto_Creation_SetsProperties()
    {
        // Arrange
        var id = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var userName = "John Doe";
        var role = TaskManager.Domain.Entities.BoardRole.Member;
        var joinedAt = DateTime.UtcNow;

        // Act
        var dto = new BoardMemberDto
        {
            Id = id,
            UserId = userId,
            UserName = userName,
            Role = role,
            JoinedAt = joinedAt
        };

        // Assert
        dto.Id.Should().Be(id);
        dto.UserId.Should().Be(userId);
        dto.UserName.Should().Be(userName);
        dto.Role.Should().Be(role);
        dto.JoinedAt.Should().Be(joinedAt);
    }

    [Fact]
    public void BoardMemberDto_DefaultValues_AreCorrect()
    {
        // Act
        var dto = new BoardMemberDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.UserId.Should().Be(Guid.Empty);
        dto.UserName.Should().BeEmpty();
        dto.Role.Should().Be(TaskManager.Domain.Entities.BoardRole.Admin);
        dto.JoinedAt.Should().Be(DateTime.MinValue);
    }
}