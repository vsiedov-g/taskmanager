using FluentAssertions;
using TaskManager.Application.Auth.Commands;

namespace TaskManager.Application.Tests.Auth.Commands;

public class SignUpCommandTests
{
    [Fact]
    public void SignUpCommand_Creation_SetsProperties()
    {
        // Arrange
        var name = "John Doe";
        var password = "password123";

        // Act
        var command = new SignUpCommand(name, password);

        // Assert
        command.Name.Should().Be(name);
        command.Password.Should().Be(password);
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("user", "")]
    [InlineData("", "")]
    public void SignUpCommand_WithEmptyFields_StillCreatesCommand(string name, string password)
    {
        // Act
        var command = new SignUpCommand(name, password);

        // Assert
        command.Name.Should().Be(name);
        command.Password.Should().Be(password);
    }

    [Fact]
    public void SignUpCommand_WithNullValues_CreatesCommand()
    {
        // Act
        var command = new SignUpCommand(null!, null!);

        // Assert
        command.Name.Should().BeNull();
        command.Password.Should().BeNull();
    }

    [Fact]
    public void SignUpCommand_WithLongValues_CreatesCommand()
    {
        // Arrange
        var longName = new string('a', 1000);
        var longPassword = new string('b', 1000);

        // Act
        var command = new SignUpCommand(longName, longPassword);

        // Assert
        command.Name.Should().Be(longName);
        command.Password.Should().Be(longPassword);
    }
}