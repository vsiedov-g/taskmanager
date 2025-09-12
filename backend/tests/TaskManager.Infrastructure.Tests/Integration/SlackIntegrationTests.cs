using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using FluentAssertions;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Models;
using TaskManager.Infrastructure.Services;

namespace TaskManager.Infrastructure.Tests.Integration;

[Collection("Integration Tests")]
public class SlackIntegrationTests : IAsyncLifetime
{
    private ServiceProvider _serviceProvider;
    private TaskManagerContext _dbContext;
    private ISlackNotifier _slackNotifier;
    private readonly string? _testWebhookUrl;

    public SlackIntegrationTests()
    {
        // Try to get test webhook URL from environment variable
        _testWebhookUrl = Environment.GetEnvironmentVariable("SLACK_TEST_WEBHOOK_URL");
        
        var services = new ServiceCollection();
        ConfigureServices(services);
        _serviceProvider = services.BuildServiceProvider();
        
        _dbContext = _serviceProvider.GetRequiredService<TaskManagerContext>();
        _slackNotifier = _serviceProvider.GetRequiredService<ISlackNotifier>();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        // Configuration
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Slack:WebhookUrl"] = _testWebhookUrl ?? "https://invalid-webhook-url.com/not-slack",
                ["Slack:Channel"] = "#integration-tests",
                ["Slack:EnableNotifications"] = "true",
                ["Slack:EnableRetries"] = "true",
                ["Slack:MaxRetryAttempts"] = "2",
                ["Slack:BaseRetryDelayMs"] = "100",
                ["Slack:RequestTimeoutSeconds"] = "10",
                ["Slack:BaseUrl"] = "https://api.test.taskmanager.com",
                ["Slack:ClientBaseUrl"] = "https://test.taskmanager.com"
            })
            .Build();

        // Database - In-Memory for integration tests
        services.AddDbContext<TaskManagerContext>(options =>
            options.UseInMemoryDatabase($"SlackIntegrationTest_{Guid.NewGuid()}"));

        // Logging
        services.AddLogging(builder => builder.AddConsole().SetMinimumLevel(LogLevel.Information));

        // Slack services
        services.Configure<SlackSettings>(configuration.GetSection("Slack"));
        services.AddHttpClient<SlackNotifierService>();
        services.AddScoped<ISlackNotifier, SlackNotifierService>();
        services.AddScoped<ISlackRetryPolicy, SlackRetryPolicy>();
        services.AddScoped<ISlackMessageBuilder, SlackMessageBuilder>();

        // Mock repositories for message builder
        services.AddScoped<TaskManager.Domain.Interfaces.IUserRepository, MockUserRepository>();
        services.AddScoped<TaskManager.Domain.Interfaces.ICardRepository, MockCardRepository>();
        services.AddScoped<TaskManager.Domain.Interfaces.IListRepository, MockListRepository>();
    }

    [Fact]
    public async Task SlackWebhook_WithValidConfiguration_ShouldSendMessageSuccessfully()
    {
        // Skip test if no real webhook URL is provided
        if (string.IsNullOrEmpty(_testWebhookUrl))
        {
            // This test requires a real Slack webhook URL set in SLACK_TEST_WEBHOOK_URL environment variable
            return;
        }

        // Arrange
        var testActivityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "Card",
            EntityId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CardId = Guid.NewGuid(),
            Description = "Integration test task created",
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _slackNotifier.SendActivityNotificationAsync(testActivityLog);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.MessageTs.Should().NotBeNullOrEmpty();
        result.AttemptCount.Should().BeGreaterThan(0);
        result.ElapsedTime.Should().BeGreaterThan(TimeSpan.Zero);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public async Task SlackWebhook_WithTestConfiguration_ShouldHandleInvalidWebhookGracefully()
    {
        // Arrange - Use invalid webhook URL for this test
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Slack:WebhookUrl"] = "https://hooks.slack.com/services/INVALID/INVALID/INVALID",
                ["Slack:Channel"] = "#test",
                ["Slack:EnableNotifications"] = "true",
                ["Slack:EnableRetries"] = "true",
                ["Slack:MaxRetryAttempts"] = "1", // Reduce retries for faster test
                ["Slack:BaseRetryDelayMs"] = "50",
                ["Slack:RequestTimeoutSeconds"] = "5"
            })
            .Build();

        services.AddDbContext<TaskManagerContext>(options =>
            options.UseInMemoryDatabase($"SlackFailTest_{Guid.NewGuid()}"));
        services.AddLogging(builder => builder.AddConsole().SetMinimumLevel(LogLevel.Warning));
        services.Configure<SlackSettings>(configuration.GetSection("Slack"));
        services.AddHttpClient<SlackNotifierService>();
        services.AddScoped<ISlackNotifier, SlackNotifierService>();
        services.AddScoped<ISlackRetryPolicy, SlackRetryPolicy>();
        services.AddScoped<ISlackMessageBuilder, SlackMessageBuilder>();
        services.AddScoped<TaskManager.Domain.Interfaces.IUserRepository, MockUserRepository>();
        services.AddScoped<TaskManager.Domain.Interfaces.ICardRepository, MockCardRepository>();
        services.AddScoped<TaskManager.Domain.Interfaces.IListRepository, MockListRepository>();

        using var provider = services.BuildServiceProvider();
        var slackNotifier = provider.GetRequiredService<ISlackNotifier>();

        var testActivityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "Card",
            EntityId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CardId = Guid.NewGuid(),
            Description = "Test task for failure scenario",
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await slackNotifier.SendActivityNotificationAsync(testActivityLog);

        // Assert - Should fail gracefully without throwing exceptions
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
        result.AttemptCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ActivityNotification_FromDatabaseChange_ShouldTriggerSlackMessage()
    {
        // Skip test if no real webhook URL is provided  
        if (string.IsNullOrEmpty(_testWebhookUrl))
        {
            return;
        }

        // Arrange - Create test entities in database
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Integration Test User",
            PasswordHash = "test_hash"
        };

        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = "Integration Test Board",
            JoinCode = "INT001",
            OwnerId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        var list = new List
        {
            Id = Guid.NewGuid(),
            Name = "Integration Test List",
            BoardId = board.Id,
            Position = 0
        };

        var card = new Card
        {
            Id = Guid.NewGuid(),
            Title = "Integration Test Task",
            Description = "This is a test task for integration testing",
            Status = CardStatus.Todo,
            Priority = CardPriority.High,
            ListId = list.Id,
            AssigneeId = user.Id,
            DueDate = DateTime.Today.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Add entities to database
        _dbContext.Users.Add(user);
        _dbContext.Boards.Add(board);
        _dbContext.Lists.Add(list);
        _dbContext.Cards.Add(card);
        await _dbContext.SaveChangesAsync();

        // Create activity log (simulating what would happen in real application)
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            Action = "CREATE",
            EntityType = "Card",
            EntityId = card.Id,
            UserId = user.Id,
            CardId = card.Id,
            Description = $"Created card '{card.Title}' in list '{list.Name}'",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync();

        // Act - Send Slack notification for the activity
        var result = await _slackNotifier.SendActivityNotificationAsync(activityLog);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.MessageTs.Should().NotBeNullOrEmpty();
        result.ErrorMessage.Should().BeNull();

        // Verify the entities are properly saved in database
        var savedCard = await _dbContext.Cards.FirstOrDefaultAsync(c => c.Id == card.Id);
        savedCard.Should().NotBeNull();
        savedCard!.Title.Should().Be("Integration Test Task");

        var savedActivityLog = await _dbContext.ActivityLogs.FirstOrDefaultAsync(a => a.Id == activityLog.Id);
        savedActivityLog.Should().NotBeNull();
        savedActivityLog!.Action.Should().Be("CREATE");
    }

    [Fact]
    public async Task SlackConfiguration_IsConfiguredCheck_ShouldValidateCorrectly()
    {
        // Act & Assert
        if (string.IsNullOrEmpty(_testWebhookUrl))
        {
            // With invalid/missing webhook, should not be configured
            var isConfigured = await _slackNotifier.IsConfiguredAsync();
            isConfigured.Should().BeFalse();
        }
        else
        {
            // With valid webhook, should be configured
            var isConfigured = await _slackNotifier.IsConfiguredAsync();
            isConfigured.Should().BeTrue();

            // Test connection should also work
            var connectionTest = await _slackNotifier.TestConnectionAsync();
            connectionTest.Should().BeTrue();
        }
    }

    public async Task InitializeAsync()
    {
        // Ensure database is created
        await _dbContext.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await _dbContext.Database.EnsureDeletedAsync();
        await _dbContext.DisposeAsync();
        await _serviceProvider.DisposeAsync();
    }
}

// Mock repositories for testing (simplified implementations)
internal class MockUserRepository : TaskManager.Domain.Interfaces.IUserRepository
{
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await Task.FromResult(new User
        {
            Id = id,
            Name = $"Test User {id.ToString()[..8]}",
            PasswordHash = "test_hash"
        });
    }

    public async Task<User?> GetByNameAsync(string name)
    {
        return await Task.FromResult(new User
        {
            Id = Guid.NewGuid(),
            Name = name,
            PasswordHash = "test_hash"
        });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await Task.FromResult(new List<User>());
    }

    public async Task AddAsync(User user)
    {
        await Task.CompletedTask;
    }

    public void Update(User user)
    {
        // Mock implementation - no actual update needed
    }

    public async Task DeleteAsync(Guid id)
    {
        await Task.CompletedTask;
    }
}

internal class MockCardRepository : TaskManager.Domain.Interfaces.ICardRepository
{
    public async Task<Card?> GetByIdAsync(Guid id)
    {
        return await Task.FromResult(new Card
        {
            Id = id,
            Title = $"Test Card {id.ToString()[..8]}",
            Description = "Test card for integration testing",
            Status = CardStatus.Todo,
            Priority = CardPriority.Medium,
            ListId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
    }

    public async Task<Card?> GetByIdWithDetailsAsync(Guid id)
    {
        return await GetByIdAsync(id);
    }

    public async Task<IEnumerable<Card>> GetAllAsync()
    {
        return await Task.FromResult(new List<Card>());
    }

    public async Task<IEnumerable<Card>> GetByListIdAsync(Guid listId)
    {
        return await Task.FromResult(new List<Card>());
    }

    public async Task AddAsync(Card card)
    {
        await Task.CompletedTask;
    }

    public void Update(Card card)
    {
        // Mock implementation - no actual update needed
    }

    public async Task DeleteAsync(Guid id)
    {
        await Task.CompletedTask;
    }
}

internal class MockListRepository : TaskManager.Domain.Interfaces.IListRepository
{
    public async Task<List?> GetByIdAsync(Guid id)
    {
        return await Task.FromResult(new List
        {
            Id = id,
            Name = $"Test List {id.ToString()[..8]}",
            Position = 0,
            BoardId = Guid.NewGuid()
        });
    }

    public async Task<List?> GetByIdWithCardsAsync(Guid id)
    {
        return await GetByIdAsync(id);
    }

    public async Task<IEnumerable<List>> GetAllAsync()
    {
        return await Task.FromResult(new List<List>());
    }

    public async Task<IEnumerable<List>> GetAllWithCardsAsync()
    {
        return await Task.FromResult(new List<List>());
    }

    public async Task<IEnumerable<List>> GetAllWithCardsByBoardIdAsync(Guid boardId)
    {
        return await Task.FromResult(new List<List>());
    }

    public async Task AddAsync(List list)
    {
        await Task.CompletedTask;
    }

    public void Update(List list)
    {
        // Mock implementation - no actual update needed
    }

    public async Task DeleteAsync(Guid id)
    {
        await Task.CompletedTask;
    }
}