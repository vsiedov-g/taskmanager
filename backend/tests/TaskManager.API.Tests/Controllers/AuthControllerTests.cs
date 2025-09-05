using AutoFixture;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.API.Controllers;
using TaskManager.Application.Auth.Commands;
using TaskManager.Application.DTOs;

namespace TaskManager.API.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _fixture = new Fixture();
        _mediatorMock = new Mock<IMediator>();
        _controller = new AuthController(_mediatorMock.Object);
    }

    [Fact]
    public async Task SignIn_WithValidCredentials_ReturnsOkWithAuthResponse()
    {
        // Arrange
        var request = new SignInRequest
        {
            Name = "testuser",
            Password = "password123"
        };

        var expectedResponse = new AuthResponse
        {
            Token = "jwt-token",
            User = new UserDto { Id = Guid.NewGuid(), Name = "testuser" }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignInCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.SignIn(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var responseValue = okResult.Value.Should().BeOfType<AuthResponse>().Subject;
        responseValue.Token.Should().Be(expectedResponse.Token);
        responseValue.User.Name.Should().Be(expectedResponse.User.Name);

        _mediatorMock.Verify(x => x.Send(
            It.Is<SignInCommand>(cmd => cmd.Name == request.Name && cmd.Password == request.Password),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SignIn_WithUnauthorizedAccessException_ReturnsUnauthorized()
    {
        // Arrange
        var request = new SignInRequest
        {
            Name = "testuser",
            Password = "wrongpassword"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignInCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        // Act
        var result = await _controller.SignIn(request);

        // Assert
        result.Should().NotBeNull();
        var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        var responseValue = unauthorizedResult.Value.Should().BeAssignableTo<object>().Subject;
        responseValue.Should().BeEquivalentTo(new { message = "Invalid credentials" });
    }

    [Fact]
    public async Task SignIn_WithGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var request = new SignInRequest
        {
            Name = "testuser",
            Password = "password123"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignInCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.SignIn(request);

        // Assert
        result.Should().NotBeNull();
        var serverErrorResult = result.Result.Should().BeOfType<ObjectResult>().Subject;
        serverErrorResult.StatusCode.Should().Be(500);
        serverErrorResult.Value.Should().BeEquivalentTo(new { message = "An error occurred during sign in" });
    }

    [Fact]
    public async Task SignUp_WithValidRequest_ReturnsOkWithAuthResponse()
    {
        // Arrange
        var request = new SignUpRequest
        {
            Name = "newuser",
            Password = "password123"
        };

        var expectedResponse = new AuthResponse
        {
            Token = "jwt-token",
            User = new UserDto { Id = Guid.NewGuid(), Name = "newuser" }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignUpCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.SignUp(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var responseValue = okResult.Value.Should().BeOfType<AuthResponse>().Subject;
        responseValue.Token.Should().Be(expectedResponse.Token);
        responseValue.User.Name.Should().Be(expectedResponse.User.Name);

        _mediatorMock.Verify(x => x.Send(
            It.Is<SignUpCommand>(cmd => cmd.Name == request.Name && cmd.Password == request.Password),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SignUp_WithInvalidOperationException_ReturnsBadRequest()
    {
        // Arrange
        var request = new SignUpRequest
        {
            Name = "existinguser",
            Password = "password123"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignUpCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("User already exists"));

        // Act
        var result = await _controller.SignUp(request);

        // Assert
        result.Should().NotBeNull();
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.Value.Should().BeEquivalentTo(new { message = "User already exists" });
    }

    [Fact]
    public async Task SignUp_WithGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var request = new SignUpRequest
        {
            Name = "newuser",
            Password = "password123"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignUpCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.SignUp(request);

        // Assert
        result.Should().NotBeNull();
        var serverErrorResult = result.Result.Should().BeOfType<ObjectResult>().Subject;
        serverErrorResult.StatusCode.Should().Be(500);
        serverErrorResult.Value.Should().BeEquivalentTo(new { message = "An error occurred during sign up" });
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("user", "")]
    [InlineData("", "")]
    public async Task SignIn_WithEmptyCredentials_StillProcessesRequest(string name, string password)
    {
        // Arrange
        var request = new SignInRequest { Name = name, Password = password };
        var expectedResponse = new AuthResponse
        {
            Token = "jwt-token",
            User = new UserDto { Id = Guid.NewGuid(), Name = name }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignInCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.SignIn(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<AuthResponse>();

        _mediatorMock.Verify(x => x.Send(
            It.Is<SignInCommand>(cmd => cmd.Name == name && cmd.Password == password),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("user", "")]
    [InlineData("", "")]
    public async Task SignUp_WithEmptyFields_StillProcessesRequest(string name, string password)
    {
        // Arrange
        var request = new SignUpRequest { Name = name, Password = password };
        var expectedResponse = new AuthResponse
        {
            Token = "jwt-token",
            User = new UserDto { Id = Guid.NewGuid(), Name = name }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignUpCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.SignUp(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<AuthResponse>();

        _mediatorMock.Verify(x => x.Send(
            It.Is<SignUpCommand>(cmd => cmd.Name == name && cmd.Password == password),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SignIn_WithLongCredentials_ProcessesRequest()
    {
        // Arrange
        var longName = new string('a', 1000);
        var longPassword = new string('b', 1000);
        var request = new SignInRequest { Name = longName, Password = longPassword };
        var expectedResponse = new AuthResponse
        {
            Token = "jwt-token",
            User = new UserDto { Id = Guid.NewGuid(), Name = longName }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<SignInCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.SignIn(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<AuthResponse>();
    }
}