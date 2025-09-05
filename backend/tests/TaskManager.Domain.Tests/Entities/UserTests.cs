using AutoFixture;
using FluentAssertions;
using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Tests.Entities;

public class UserTests
{
    private readonly Fixture _fixture;

    public UserTests()
    {
        _fixture = new Fixture();
    }

    [Fact]
    public void User_Creation_SetsDefaultValues()
    {
        // Act
        var user = new User();

        // Assert
        user.Id.Should().Be(Guid.Empty);
        user.Name.Should().BeEmpty();
        user.PasswordHash.Should().BeEmpty();
    }

    [Fact]
    public void User_SetValidProperties_Success()
    {
        // Arrange
        var user = new User();
        var name = _fixture.Create<string>();
        var passwordHash = _fixture.Create<string>();

        // Act
        user.Name = name;
        user.PasswordHash = passwordHash;

        // Assert
        user.Name.Should().Be(name);
        user.PasswordHash.Should().Be(passwordHash);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void User_SetName_HandlesNullEmptyAndWhitespace(string? name)
    {
        // Arrange
        var user = new User();

        // Act & Assert - Should not throw
        user.Name = name ?? string.Empty;
        user.Name.Should().Be(name ?? string.Empty);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void User_SetPasswordHash_HandlesNullAndEmpty(string? passwordHash)
    {
        // Arrange
        var user = new User();

        // Act & Assert - Should not throw
        user.PasswordHash = passwordHash ?? string.Empty;
        user.PasswordHash.Should().Be(passwordHash ?? string.Empty);
    }

    [Fact]
    public void User_SetId_Success()
    {
        // Arrange
        var user = new User();
        var id = _fixture.Create<Guid>();

        // Act
        user.Id = id;

        // Assert
        user.Id.Should().Be(id);
    }

    [Fact]
    public void User_DefaultId_IsEmpty()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void User_TwoInstances_HaveSameDefaultIds()
    {
        // Arrange & Act
        var user1 = new User();
        var user2 = new User();

        // Assert
        user1.Id.Should().Be(user2.Id);
        user1.Id.Should().Be(Guid.Empty);
        user2.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void User_WithValidData_IsValid()
    {
        // Arrange
        var name = "John Doe";
        var passwordHash = "hashed_password_123";

        // Act
        var user = new User
        {
            Name = name,
            PasswordHash = passwordHash
        };

        // Assert
        user.Name.Should().Be(name);
        user.PasswordHash.Should().Be(passwordHash);
        user.Id.Should().Be(Guid.Empty); // Will be set by application layer when creating
    }
}