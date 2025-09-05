using AutoFixture;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.API.Controllers;
using TaskManager.Application.DTOs;
using TaskManager.Application.Lists.Commands;
using TaskManager.Application.Lists.Queries;

namespace TaskManager.API.Tests.Controllers;

public class ListsControllerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly ListsController _controller;

    public ListsControllerTests()
    {
        _fixture = new Fixture();
        _mediatorMock = new Mock<IMediator>();
        _controller = new ListsController(_mediatorMock.Object);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task GetLists_WithBoardId_ReturnsOkWithLists()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var expectedLists = new List<ListDto>
        {
            new ListDto
            {
                Id = Guid.NewGuid(),
                Name = "To Do",
                Position = 1,
            },
            new ListDto
            {
                Id = Guid.NewGuid(),
                Name = "In Progress",
                Position = 2,
            },
            new ListDto
            {
                Id = Guid.NewGuid(),
                Name = "Done",
                Position = 3,
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetListsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLists);

        // Act
        var result = await _controller.GetLists(boardId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var lists = okResult.Value.Should().BeAssignableTo<List<ListDto>>().Subject;
        lists.Should().HaveCount(3);
        lists.Should().BeEquivalentTo(expectedLists);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetListsQuery>(q => q.BoardId == boardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetList_WithExistingList_ReturnsOkWithList()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var expectedList = new ListDto
        {
            Id = listId,
            Name = "Test List",
            Position = 1
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetListByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedList);

        // Act
        var result = await _controller.GetList(listId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var list = okResult.Value.Should().BeAssignableTo<ListDto>().Subject;
        list.Should().BeEquivalentTo(expectedList);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetListByIdQuery>(q => q.Id == listId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetList_WithNonExistentList_ReturnsNotFound()
    {
        // Arrange
        var listId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetListByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ListDto?)null);

        // Act
        var result = await _controller.GetList(listId);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateList_WithValidRequest_ReturnsCreatedList()
    {
        // Arrange
        var request = new CreateListRequest
        {
            Title = "New List",
            Position = 1,
            BoardId = Guid.NewGuid()
        };

        var expectedList = new ListDto
        {
            Id = Guid.NewGuid(),
            Name = request.Title,
            Position = request.Position,
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateListCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedList);

        // Act
        var result = await _controller.CreateList(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(ListsController.GetList));
        createdResult.RouteValues.Should().ContainKey("id").WhoseValue.Should().Be(expectedList.Id);

        var list = createdResult.Value.Should().BeAssignableTo<ListDto>().Subject;
        list.Should().BeEquivalentTo(expectedList);

        _mediatorMock.Verify(x => x.Send(
            It.Is<CreateListCommand>(c => 
                c.Title == request.Title &&
                c.Position == request.Position &&
                c.BoardId == request.BoardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateList_WithExistingList_ReturnsUpdatedList()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var request = new UpdateListRequest
        {
            Title = "Updated List",
            Position = 2
        };

        var expectedList = new ListDto
        {
            Id = listId,
            Name = request.Title,
            Position = request.Position,
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateListCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedList);

        // Act
        var result = await _controller.UpdateList(listId, request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var list = okResult.Value.Should().BeAssignableTo<ListDto>().Subject;
        list.Should().BeEquivalentTo(expectedList);

        _mediatorMock.Verify(x => x.Send(
            It.Is<UpdateListCommand>(c => 
                c.Id == listId &&
                c.Title == request.Title &&
                c.Position == request.Position),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateList_WithNonExistentList_ReturnsNotFound()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var request = new UpdateListRequest
        {
            Title = "Updated List",
            Position = 1
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateListCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ListDto?)null);

        // Act
        var result = await _controller.UpdateList(listId, request);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteList_WithExistingList_ReturnsNoContent()
    {
        // Arrange
        var listId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<DeleteListCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteList(listId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();

        _mediatorMock.Verify(x => x.Send(
            It.Is<DeleteListCommand>(c => c.Id == listId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteList_WithNonExistentList_ReturnsNotFound()
    {
        // Arrange
        var listId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<DeleteListCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteList(listId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task ReorderLists_WithValidRequest_ReturnsReorderedLists()
    {
        // Arrange
        var listIds = new List<Guid>
        {
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid()
        };

        var request = new ReorderListsRequest
        {
            ListIds = listIds
        };

        var expectedLists = new List<ListDto>
        {
            new ListDto
            {
                Id = listIds[0],
                Name = "List 1",
                Position = 1,
            },
            new ListDto
            {
                Id = listIds[1],
                Name = "List 2",
                Position = 2,
            },
            new ListDto
            {
                Id = listIds[2],
                Name = "List 3",
                Position = 3,
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<ReorderListsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLists);

        // Act
        var result = await _controller.ReorderLists(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var lists = okResult.Value.Should().BeAssignableTo<List<ListDto>>().Subject;
        lists.Should().HaveCount(3);
        lists.Should().BeEquivalentTo(expectedLists);

        _mediatorMock.Verify(x => x.Send(
            It.Is<ReorderListsCommand>(c => c.ListIds.SequenceEqual(listIds)),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData("", 1)]
    [InlineData("Valid Title", 0)]
    [InlineData("Another Title", 5)]
    public async Task CreateList_WithVariousInputs_ProcessesCorrectly(string title, int position)
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var request = new CreateListRequest
        {
            Title = title,
            Position = position,
            BoardId = boardId
        };

        var expectedList = new ListDto
        {
            Id = Guid.NewGuid(),
            Name = title,
            Position = position
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateListCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedList);

        // Act
        var result = await _controller.CreateList(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var list = createdResult.Value.Should().BeAssignableTo<ListDto>().Subject;
        list.Name.Should().Be(title);
        list.Position.Should().Be(position);
    }

    [Fact]
    public async Task CreateList_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var request = new CreateListRequest
        {
            Title = "Test List",
            Position = 1,
            BoardId = Guid.NewGuid()
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateListCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Creation failed"));

        // Act & Assert
        var act = async () => await _controller.CreateList(request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Creation failed");
    }

    [Fact]
    public async Task UpdateList_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var listId = Guid.NewGuid();
        var request = new UpdateListRequest
        {
            Title = "Updated List",
            Position = 1
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateListCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Update failed"));

        // Act & Assert
        var act = async () => await _controller.UpdateList(listId, request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Update failed");
    }

    [Fact]
    public async Task GetLists_WithEmptyBoardId_CallsMediatorCorrectly()
    {
        // Arrange
        var boardId = Guid.Empty;
        var expectedLists = new List<ListDto>();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetListsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLists);

        // Act
        var result = await _controller.GetLists(boardId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var lists = okResult.Value.Should().BeAssignableTo<List<ListDto>>().Subject;
        lists.Should().BeEmpty();

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetListsQuery>(q => q.BoardId == Guid.Empty),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReorderLists_WithEmptyListIds_ReturnsEmptyResult()
    {
        // Arrange
        var request = new ReorderListsRequest
        {
            ListIds = new List<Guid>()
        };

        var expectedLists = new List<ListDto>();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<ReorderListsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLists);

        // Act
        var result = await _controller.ReorderLists(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var lists = okResult.Value.Should().BeAssignableTo<List<ListDto>>().Subject;
        lists.Should().BeEmpty();
    }

    [Fact]
    public async Task ReorderLists_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var request = new ReorderListsRequest
        {
            ListIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<ReorderListsCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Reorder failed"));

        // Act & Assert
        var act = async () => await _controller.ReorderLists(request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Reorder failed");
    }
}