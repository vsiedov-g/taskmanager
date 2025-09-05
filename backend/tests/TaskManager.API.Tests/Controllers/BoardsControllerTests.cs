using AutoFixture;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using TaskManager.API.Controllers;
using TaskManager.Application.Boards.Commands;
using TaskManager.Application.Boards.Queries;

namespace TaskManager.API.Tests.Controllers;

public class BoardsControllerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly BoardsController _controller;
    private readonly Guid _userId = Guid.NewGuid();

    public BoardsControllerTests()
    {
        _fixture = new Fixture();
        _mediatorMock = new Mock<IMediator>();
        _controller = new BoardsController(_mediatorMock.Object);
        
        // Setup user claims for authorization
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, _userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            }
        };
    }

    [Fact]
    public async Task GetUserBoards_WithValidUser_ReturnsBoards()
    {
        // Arrange
        var expectedBoards = new List<BoardDto>
        {
            new BoardDto
            {
                Id = Guid.NewGuid(),
                Name = "Board 1",
                Description = "Description 1",
                CreatedAt = DateTime.UtcNow,
                UserRole = TaskManager.Domain.Entities.BoardRole.Admin
            },
            new BoardDto
            {
                Id = Guid.NewGuid(),
                Name = "Board 2",
                Description = "Description 2", 
                CreatedAt = DateTime.UtcNow,
                UserRole = TaskManager.Domain.Entities.BoardRole.Member
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetUserBoardsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedBoards);

        // Act
        var result = await _controller.GetUserBoards();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var boards = okResult.Value.Should().BeAssignableTo<List<BoardDto>>().Subject;
        boards.Should().HaveCount(2);
        boards[0].Name.Should().Be("Board 1");
        boards[1].Name.Should().Be("Board 2");

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetUserBoardsQuery>(q => q.UserId == _userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetBoardDetails_WithValidBoard_ReturnsBoardDetails()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var expectedBoard = new BoardDetailsDto
        {
            Id = boardId,
            Name = "Test Board",
            Description = "Test Description",
            UserRole = TaskManager.Domain.Entities.BoardRole.Admin,
            Members = new List<BoardMemberDto>()
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetBoardDetailsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedBoard);

        // Act
        var result = await _controller.GetBoardDetails(boardId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var board = okResult.Value.Should().BeAssignableTo<BoardDetailsDto>().Subject;
        board.Id.Should().Be(boardId);
        board.Name.Should().Be("Test Board");

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetBoardDetailsQuery>(q => q.BoardId == boardId && q.UserId == _userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetBoardDetails_WithNonExistentBoard_ReturnsNotFound()
    {
        // Arrange
        var boardId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetBoardDetailsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((BoardDetailsDto?)null);

        // Act
        var result = await _controller.GetBoardDetails(boardId);

        // Assert
        result.Should().NotBeNull();
        var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().Be("Board not found or you don't have access to it");
    }

    [Fact]
    public async Task CreateBoard_WithValidRequest_ReturnsCreatedBoard()
    {
        // Arrange
        var request = new CreateBoardRequest
        {
            Name = "New Board",
            Description = "New Description"
        };

        var expectedResult = new CreateBoardResult
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            JoinCode = "ABC123",
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateBoardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateBoard(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(BoardsController.GetBoardDetails));
        createdResult.RouteValues.Should().ContainKey("id").WhoseValue.Should().Be(expectedResult.Id);
        
        var board = createdResult.Value.Should().BeAssignableTo<CreateBoardResult>().Subject;
        board.Name.Should().Be(request.Name);
        board.Description.Should().Be(request.Description);

        _mediatorMock.Verify(x => x.Send(
            It.Is<CreateBoardCommand>(c => c.Name == request.Name && c.Description == request.Description && c.UserId == _userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task JoinBoard_WithValidCode_ReturnsSuccess()
    {
        // Arrange
        var request = new JoinBoardRequest { JoinCode = "abc123" };
        var expectedResult = new JoinBoardResult
        {
            Success = true,
            Message = "Successfully joined board",
            BoardId = Guid.NewGuid()
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<JoinBoardByCodeCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.JoinBoard(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var joinResult = okResult.Value.Should().BeAssignableTo<JoinBoardResult>().Subject;
        joinResult.Success.Should().BeTrue();
        joinResult.Message.Should().Be("Successfully joined board");

        _mediatorMock.Verify(x => x.Send(
            It.Is<JoinBoardByCodeCommand>(c => c.JoinCode == "ABC123" && c.UserId == _userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task JoinBoard_WithInvalidCode_ReturnsBadRequest()
    {
        // Arrange
        var request = new JoinBoardRequest { JoinCode = "invalid" };
        var expectedResult = new JoinBoardResult
        {
            Success = false,
            Message = "Invalid join code"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<JoinBoardByCodeCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.JoinBoard(request);

        // Assert
        result.Should().NotBeNull();
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.Value.Should().Be("Invalid join code");
    }

    [Fact]
    public async Task JoinBoard_ConvertsJoinCodeToUpperCase()
    {
        // Arrange
        var request = new JoinBoardRequest { JoinCode = "lowercase123" };
        var expectedResult = new JoinBoardResult { Success = true, Message = "Success" };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<JoinBoardByCodeCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        await _controller.JoinBoard(request);

        // Assert
        _mediatorMock.Verify(x => x.Send(
            It.Is<JoinBoardByCodeCommand>(c => c.JoinCode == "LOWERCASE123"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData("", "")]
    [InlineData("Board Name", "")]
    [InlineData("", "Board Description")]
    [InlineData("Long Board Name", "Very detailed board description")]
    public async Task CreateBoard_WithVariousInputs_ProcessesCorrectly(string name, string description)
    {
        // Arrange
        var request = new CreateBoardRequest { Name = name, Description = description };
        var expectedResult = new CreateBoardResult
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            JoinCode = "ABC123",
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateBoardCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateBoard(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var board = createdResult.Value.Should().BeAssignableTo<CreateBoardResult>().Subject;
        board.Name.Should().Be(name);
        board.Description.Should().Be(description);
    }

    [Fact]
    public async Task GetUserBoards_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetUserBoardsQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        var act = async () => await _controller.GetUserBoards();
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Database error");
    }

    [Fact]
    public async Task CreateBoard_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var request = new CreateBoardRequest { Name = "Test", Description = "Test" };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateBoardCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Creation failed"));

        // Act & Assert
        var act = async () => await _controller.CreateBoard(request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Creation failed");
    }
}