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

public class SignUpCommandHandlerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordService> _passwordServiceMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SignUpCommandHandler _handler;

    public SignUpCommandHandlerTests()
    {
        _fixture = new Fixture();
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordServiceMock = new Mock<IPasswordService>();
        _jwtServiceMock = new Mock<IJwtService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        
        _handler = new SignUpCommandHandler(
            _userRepositoryMock.Object,
            _passwordServiceMock.Object,
            _jwtServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsAuthResponse()
    {
        // Arrange
        var command = new SignUpCommand("John Doe", "password123");
        var hashedPassword = "hashed_password";
        var token = "jwt_token";

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync((User?)null);

        _passwordServiceMock
            .Setup(x => x.HashPassword(command.Password))
            .Returns(hashedPassword);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(token);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(token);
        result.User.Should().NotBeNull();
        result.User.Name.Should().Be(command.Name);
        result.User.Id.Should().NotBe(Guid.Empty);

        _userRepositoryMock.Verify(x => x.GetByNameAsync(command.Name), Times.Once);
        _passwordServiceMock.Verify(x => x.HashPassword(command.Password), Times.Once);
        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _jwtServiceMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithExistingUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var command = new SignUpCommand("ExistingUser", "password123");
        var existingUser = new User { Name = command.Name, Id = Guid.NewGuid() };

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync(existingUser);

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("User with this name already exists");

        _userRepositoryMock.Verify(x => x.GetByNameAsync(command.Name), Times.Once);
        _passwordServiceMock.Verify(x => x.HashPassword(It.IsAny<string>()), Times.Never);
        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithValidRequest_CreatesUserWithCorrectProperties()
    {
        // Arrange
        var command = new SignUpCommand("John Doe", "password123");
        var hashedPassword = "hashed_password";
        var token = "jwt_token";
        User? capturedUser = null;

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync((User?)null);

        _passwordServiceMock
            .Setup(x => x.HashPassword(command.Password))
            .Returns(hashedPassword);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(token);

        _userRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<User>()))
            .Callback<User>(user => capturedUser = user);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedUser.Should().NotBeNull();
        capturedUser!.Name.Should().Be(command.Name);
        capturedUser.PasswordHash.Should().Be(hashedPassword);
        capturedUser.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_WithValidRequest_GeneratesTokenForCorrectUser()
    {
        // Arrange
        var command = new SignUpCommand("John Doe", "password123");
        var hashedPassword = "hashed_password";
        var token = "jwt_token";
        User? tokenGeneratedForUser = null;

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync((User?)null);

        _passwordServiceMock
            .Setup(x => x.HashPassword(command.Password))
            .Returns(hashedPassword);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Callback<User>(user => tokenGeneratedForUser = user)
            .Returns(token);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        tokenGeneratedForUser.Should().NotBeNull();
        tokenGeneratedForUser!.Name.Should().Be(command.Name);
        tokenGeneratedForUser.PasswordHash.Should().Be(hashedPassword);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("a")]
    [InlineData("very_long_username_that_exceeds_normal_limits")]
    public async Task Handle_WithVariousValidUsernames_CreatesUsers(string name)
    {
        // Arrange
        var command = new SignUpCommand(name, "password123");
        var hashedPassword = "hashed_password";
        var token = "jwt_token";

        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(name))
            .ReturnsAsync((User?)null);

        _passwordServiceMock
            .Setup(x => x.HashPassword(command.Password))
            .Returns(hashedPassword);

        _jwtServiceMock
            .Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(token);

        _unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.User.Name.Should().Be(name);
        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_PropagatesException()
    {
        // Arrange
        var command = new SignUpCommand("John Doe", "password123");
        
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
        var command = new SignUpCommand("John Doe", "password123");
        
        _userRepositoryMock
            .Setup(x => x.GetByNameAsync(command.Name))
            .ReturnsAsync((User?)null);

        _passwordServiceMock
            .Setup(x => x.HashPassword(command.Password))
            .Throws(new Exception("Hashing error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, CancellationToken.None);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Hashing error");
    }
}