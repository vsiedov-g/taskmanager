using FluentAssertions;
using TaskManager.Application.Auth.Commands;

namespace TaskManager.Application.Tests.Auth.Commands;

public class SignInCommandTests
{
    [Fact]
    public void SignInCommand_Creation_SetsProperties()
    {
        // Arrange
        var name = "John Doe";
        var password = "password123";

        // Act
        var command = new SignInCommand(name, password);

        // Assert
        command.Name.Should().Be(name);
        command.Password.Should().Be(password);
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("user", "")]
    [InlineData("", "")]
    public void SignInCommand_WithEmptyFields_StillCreatesCommand(string name, string password)
    {
        // Act
        var command = new SignInCommand(name, password);

        // Assert
        command.Name.Should().Be(name);
        command.Password.Should().Be(password);
    }

    [Fact]
    public void SignInCommand_WithNullValues_CreatesCommand()
    {
        // Act
        var command = new SignInCommand(null!, null!);

        // Assert
        command.Name.Should().BeNull();
        command.Password.Should().BeNull();
    }

    [Fact]
    public void SignInCommand_WithSpecialCharacters_CreatesCommand()
    {
        // Arrange
        var nameWithSpecialChars = "user@domain.com";
        var passwordWithSpecialChars = "p@ssw0rd!#$";

        // Act
        var command = new SignInCommand(nameWithSpecialChars, passwordWithSpecialChars);

        // Assert
        command.Name.Should().Be(nameWithSpecialChars);
        command.Password.Should().Be(passwordWithSpecialChars);
    }
}