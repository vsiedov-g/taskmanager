using AutoFixture;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.API.Controllers;
using TaskManager.Application.ActivityLogs.Commands;
using TaskManager.Application.ActivityLogs.Queries;
using TaskManager.Domain.Entities;

namespace TaskManager.API.Tests.Controllers;

public class ActivityLogsControllerTests
{
    private readonly Fixture _fixture;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly ActivityLogsController _controller;

    public ActivityLogsControllerTests()
    {
        _fixture = new Fixture();
        _mediatorMock = new Mock<IMediator>();
        _controller = new ActivityLogsController(_mediatorMock.Object);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task GetActivityLogs_WithoutBoardId_ReturnsAllActivityLogs()
    {
        // Arrange
        var expectedLogs = new List<ActivityLog>
        {
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Created card",
                EntityType = "Card",
                EntityId = Guid.NewGuid(),
                Description = "Created new card",
                UserId = Guid.NewGuid(),
                CardId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            },
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Updated card",
                EntityType = "Card",
                EntityId = Guid.NewGuid(),
                Description = "Updated card status",
                UserId = Guid.NewGuid(),
                CardId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow.AddMinutes(-2)
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await _controller.GetActivityLogs();

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLogs = okResult.Value.Should().BeAssignableTo<List<ActivityLog>>().Subject;
        activityLogs.Should().HaveCount(2);
        activityLogs.Should().BeEquivalentTo(expectedLogs);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetActivityLogsQuery>(q => 
                q.BoardId == null && 
                q.Page == 1 && 
                q.PageSize == 50),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetActivityLogs_WithBoardId_ReturnsFilteredActivityLogs()
    {
        // Arrange
        var boardId = Guid.NewGuid();
        var expectedLogs = new List<ActivityLog>
        {
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Created card in board",
                EntityType = "Card",
                EntityId = Guid.NewGuid(),
                Description = "Card created",
                UserId = Guid.NewGuid(),
                CardId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await _controller.GetActivityLogs(boardId: boardId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLogs = okResult.Value.Should().BeAssignableTo<List<ActivityLog>>().Subject;
        activityLogs.Should().HaveCount(1);
        activityLogs.Should().BeEquivalentTo(expectedLogs);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetActivityLogsQuery>(q => 
                q.BoardId == boardId && 
                q.Page == 1 && 
                q.PageSize == 50),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetActivityLogs_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        var expectedLogs = new List<ActivityLog>
        {
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Action 3",
                EntityType = "Card",
                Description = "Details 3",
                UserId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            },
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Action 4",
                EntityType = "Card", 
                Description = "Details 4",
                UserId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await _controller.GetActivityLogs(page: 2, pageSize: 2);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLogs = okResult.Value.Should().BeAssignableTo<List<ActivityLog>>().Subject;
        activityLogs.Should().HaveCount(2);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetActivityLogsQuery>(q => 
                q.Page == 2 && 
                q.PageSize == 2),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetActivityLog_WithExistingId_ReturnsActivityLog()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();
        var expectedLog = new ActivityLog
        {
            Id = activityLogId,
            Action = "Test Action",
            EntityType = "Card",
            Description = "Test Description",
            UserId = Guid.NewGuid(),
            CardId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLog);

        // Act
        var result = await _controller.GetActivityLog(activityLogId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLog = okResult.Value.Should().BeAssignableTo<ActivityLog>().Subject;
        activityLog.Should().BeEquivalentTo(expectedLog);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetActivityLogByIdQuery>(q => q.Id == activityLogId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetActivityLog_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ActivityLog?)null);

        // Act
        var result = await _controller.GetActivityLog(activityLogId);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetActivityLogsByCard_ReturnsCardActivityLogs()
    {
        // Arrange
        var cardId = Guid.NewGuid();
        var expectedLogs = new List<ActivityLog>
        {
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Created Card",
                Description = "Card created",
                UserId = Guid.NewGuid(),
                CardId = cardId,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "Updated Card",
                Description = "Card updated",
                UserId = Guid.NewGuid(),
                CardId = cardId,
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogsByCardQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await _controller.GetActivityLogsByCard(cardId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLogs = okResult.Value.Should().BeAssignableTo<List<ActivityLog>>().Subject;
        activityLogs.Should().HaveCount(2);
        activityLogs.Should().BeEquivalentTo(expectedLogs);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetActivityLogsByCardQuery>(q => q.CardId == cardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetActivityLogsByUser_ReturnsUserActivityLogs()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedLogs = new List<ActivityLog>
        {
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "User Action 1",
                Description = "Action by user",
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new ActivityLog
            {
                Id = Guid.NewGuid(),
                Action = "User Action 2",
                Description = "Another action by user",
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            }
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<GetActivityLogsByUserQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLogs);

        // Act
        var result = await _controller.GetActivityLogsByUser(userId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLogs = okResult.Value.Should().BeAssignableTo<List<ActivityLog>>().Subject;
        activityLogs.Should().HaveCount(2);
        activityLogs.Should().BeEquivalentTo(expectedLogs);

        _mediatorMock.Verify(x => x.Send(
            It.Is<GetActivityLogsByUserQuery>(q => q.UserId == userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateActivityLog_WithValidData_CreatesAndReturnsActivityLog()
    {
        // Arrange
        var request = new CreateActivityLogRequest
        {
            Action = "New Action",
            EntityType = "Card",
            EntityId = Guid.NewGuid(),
            Description = "New Description",
            UserId = Guid.NewGuid(),
            CardId = Guid.NewGuid()
        };

        var expectedLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            UserId = request.UserId,
            CardId = request.CardId,
            CreatedAt = DateTime.UtcNow
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLog);

        // Act
        var result = await _controller.CreateActivityLog(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(ActivityLogsController.GetActivityLog));
        createdResult.RouteValues.Should().ContainKey("id").WhoseValue.Should().Be(expectedLog.Id);

        var activityLog = createdResult.Value.Should().BeAssignableTo<ActivityLog>().Subject;
        activityLog.Should().BeEquivalentTo(expectedLog);

        _mediatorMock.Verify(x => x.Send(
            It.Is<CreateActivityLogCommand>(c => 
                c.Action == request.Action &&
                c.EntityType == request.EntityType &&
                c.EntityId == request.EntityId &&
                c.Description == request.Description &&
                c.UserId == request.UserId &&
                c.CardId == request.CardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateActivityLog_WithExistingLog_UpdatesAndReturnsActivityLog()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();
        var request = new UpdateActivityLogRequest
        {
            Action = "Updated Action",
            EntityType = "Card",
            EntityId = Guid.NewGuid(),
            Description = "Updated Description",
            UserId = Guid.NewGuid(),
            CardId = Guid.NewGuid()
        };

        var expectedLog = new ActivityLog
        {
            Id = activityLogId,
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            UserId = request.UserId,
            CardId = request.CardId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedLog);

        // Act
        var result = await _controller.UpdateActivityLog(activityLogId, request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var activityLog = okResult.Value.Should().BeAssignableTo<ActivityLog>().Subject;
        activityLog.Should().BeEquivalentTo(expectedLog);

        _mediatorMock.Verify(x => x.Send(
            It.Is<UpdateActivityLogCommand>(c => 
                c.Id == activityLogId &&
                c.Action == request.Action &&
                c.EntityType == request.EntityType &&
                c.EntityId == request.EntityId &&
                c.Description == request.Description &&
                c.UserId == request.UserId &&
                c.CardId == request.CardId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateActivityLog_WithNonExistentLog_ReturnsNotFound()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();
        var request = new UpdateActivityLogRequest
        {
            Action = "Updated Action",
            Description = "Updated Description"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ActivityLog?)null);

        // Act
        var result = await _controller.UpdateActivityLog(activityLogId, request);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteActivityLog_WithExistingLog_ReturnsNoContent()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<DeleteActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteActivityLog(activityLogId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();

        _mediatorMock.Verify(x => x.Send(
            It.Is<DeleteActivityLogCommand>(c => c.Id == activityLogId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteActivityLog_WithNonExistentLog_ReturnsNotFound()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<DeleteActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteActivityLog(activityLogId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateActivityLog_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var request = new CreateActivityLogRequest
        {
            Action = "Test Action",
            EntityType = "Card"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Creation failed"));

        // Act & Assert
        var act = async () => await _controller.CreateActivityLog(request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Creation failed");
    }

    [Fact]
    public async Task UpdateActivityLog_WhenMediatorThrows_PropagatesException()
    {
        // Arrange
        var activityLogId = Guid.NewGuid();
        var request = new UpdateActivityLogRequest
        {
            Action = "Test Action"
        };

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<UpdateActivityLogCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Update failed"));

        // Act & Assert
        var act = async () => await _controller.UpdateActivityLog(activityLogId, request);
        
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Update failed");
    }
}