using FluentAssertions;
using TaskManager.Application.Boards.Commands;

namespace TaskManager.Application.Tests.Boards.Commands;

public class JoinBoardByCodeCommandTests
{
    [Fact]
    public void JoinBoardByCodeCommand_Creation_SetsProperties()
    {
        // Arrange
        var joinCode = "ABC123";
        var userId = Guid.NewGuid();

        // Act
        var command = new JoinBoardByCodeCommand
        {
            JoinCode = joinCode,
            UserId = userId
        };

        // Assert
        command.JoinCode.Should().Be(joinCode);
        command.UserId.Should().Be(userId);
    }

    [Fact]
    public void JoinBoardByCodeCommand_DefaultValues_AreCorrect()
    {
        // Act
        var command = new JoinBoardByCodeCommand();

        // Assert
        command.JoinCode.Should().BeEmpty();
        command.UserId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void JoinBoardResult_Creation_SetsProperties()
    {
        // Arrange
        var success = true;
        var message = "Success message";
        var boardId = Guid.NewGuid();

        // Act
        var result = new JoinBoardResult
        {
            Success = success,
            Message = message,
            BoardId = boardId
        };

        // Assert
        result.Success.Should().Be(success);
        result.Message.Should().Be(message);
        result.BoardId.Should().Be(boardId);
    }

    [Fact]
    public void JoinBoardResult_DefaultValues_AreCorrect()
    {
        // Act
        var result = new JoinBoardResult();

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().BeEmpty();
        result.BoardId.Should().BeNull();
    }
}