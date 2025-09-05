using AutoFixture;
using FluentAssertions;
using Moq;
using TaskManager.Application.Auth.Commands;
using TaskManager.Application.Auth.Handlers;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Auth.Handlers;

public class SignInCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordService> _passwordServiceMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SignInCommandHandler _handler;

    public SignInCommandHandlerTests()
    {
        _fixture = new Fixture();
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordServiceMock = new Mock<IPasswordService>();
        _jwtServiceMock = new Mock<IJwtService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        
        _handler = new SignInCommandHandler(
            _userRepositoryMock.Object,
            _passwordServiceMock.Object,
            _jwtServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var command = new SignInCommand("John Doe", "password123");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            PasswordHash = "hashed_password"
        };
        var token = "jwt_token";

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync(user);

        _passwordServiceMock
            .Setup(x => x.VerifyPassword(command.Password, user.PasswordHash))
            .Returns(true);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(user))
            .Returns(token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(token);
        result.User.Should().NotBeNull();
        result.User.Name.Should().Be(user.Name);
        result.User.Id.Should().Be(user.Id);

        _userRepositoryMock.Verify(x => x.GetByNameAsync(command.Name), Times.Once);
        _passwordServiceMock.Verify(x => x.VerifyPassword(command.Password, user.PasswordHash), Times.Once);
        _jwtServiceMock.Verify(x => x.GenerateToken(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var command = new SignInCommand("NonExistentUser", "password123");

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync((User?)null);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid name or password");

        _userRepositoryMock.Verify(x => x.GetByNameAsync(command.Name), Times.Once);
        _passwordServiceMock.Verify(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        _jwtServiceMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithIncorrectPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var command = new SignInCommand("John Doe", "wrongpassword");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            PasswordHash = "hashed_password"
        };

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync(user);

        _passwordServiceMock
            .Setup(x => x.VerifyPassword(command.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid name or password");

        _userRepositoryMock.Verify(x => x.GetByNameAsync(command.Name), Times.Once);
        _passwordServiceMock.Verify(x => x.VerifyPassword(command.Password, user.PasswordHash), Times.Once);
        _jwtServiceMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithValidCredentials_GeneratesTokenForCorrectUser()
    {
        // Arrange
        var command = new SignInCommand("John Doe", "password123");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            PasswordHash = "hashed_password"
        };
        var token = "jwt_token";
        User? tokenGeneratedForUser = null;

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync(user);

        _passwordServiceMock
            .Setup(x => x.VerifyPassword(command.Password, user.PasswordHash))
            .Returns(true);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Callback<User>(u => tokenGeneratedForUser = u)
            .Returns(token);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        tokenGeneratedForUser.Should().NotBeNull();
        tokenGeneratedForUser!.Id.Should().Be(user.Id);
        tokenGeneratedForUser.Name.Should().Be(user.Name);
        tokenGeneratedForUser.PasswordHash.Should().Be(user.PasswordHash);
    }

    [Theory]
    [InlineData("user1", "pass1")]
    [InlineData("", "")]
    [InlineData("user@domain.com", "complex_p@ssw0rd!")]
    public async Task Handle_WithVariousValidCredentials_ReturnsAuthResponse(string name, string password)
    {
        // Arrange
        var command = new SignInCommand(name, password);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = name,
            PasswordHash = "hashed_password"
        };
        var token = "jwt_token";

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(name))
            .ReturnsAsync(user);

        _passwordServiceMock
            .Setup(x => x.VerifyPassword(password, user.PasswordHash))
            .Returns(true);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(user))
            .Returns(token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.Name.Should().Be(name);
        result.Token.Should().Be(token);
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var command = new SignInCommand("John Doe", "password123");
        
        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }

    [Fact]
    public async Task Handle_WhenPasswordServiceThrows_PropagatesException()
    {
        // Arrange
        var command = new SignInCommand("John Doe", "password123");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            PasswordHash = "hashed_password"
        };

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync(user);

        _passwordServiceMock
            .Setup(x => x.VerifyPassword(command.Password, user.PasswordHash))
            .Throws(new Exception("Password verification error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Password verification error");
    }

    [Fact]
    public async Task Handle_WhenJwtServiceThrows_PropagatesException()
    {
        // Arrange
        var command = new SignInCommand("John Doe", "password123");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            PasswordHash = "hashed_password"
        };

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync(user);

        _passwordServiceMock
            .Setup(x => x.VerifyPassword(command.Password, user.PasswordHash))
            .Returns(true);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(user))
            .Throws(new Exception("JWT generation error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("JWT generation error");
    }
}