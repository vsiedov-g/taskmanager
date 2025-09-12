using FluentAssertions;
using TaskManager.Infrastructure.Models;

namespace TaskManager.Infrastructure.Tests.Models;

public class SlackSettingsTests
{
    [Fact]
    public void SlackSettings_DefaultValues_ShouldBeSetCorrectly()
    {
        // Arrange & Act
        var settings = new SlackSettings();

        // Assert
        settings.WebhookUrl.Should().Be(string.Empty);
        settings.Channel.Should().Be("#general");
        settings.BaseUrl.Should().Be(string.Empty);
        settings.ClientBaseUrl.Should().Be(string.Empty);
        settings.EnableNotifications.Should().BeTrue();
        settings.EnableRetries.Should().BeTrue();
        settings.MaxRetryAttempts.Should().Be(3);
        settings.BaseRetryDelayMs.Should().Be(1000);
        settings.MaxRetryDelayMs.Should().Be(30000);
        settings.RequestTimeoutSeconds.Should().Be(30);
    }

    [Theory]
    [InlineData("https://hooks.slack.com/services/T123/B456/xyz")]
    [InlineData("https://hooks.slack.com/services/TEAM123/BOT456/secrettoken")]
    public void SlackSettings_WithValidWebhookUrl_ShouldAcceptValue(string webhookUrl)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            WebhookUrl = webhookUrl
        };

        // Assert
        settings.WebhookUrl.Should().Be(webhookUrl);
    }

    [Theory]
    [InlineData("#general")]
    [InlineData("#project-alerts")]
    [InlineData("#dev-notifications")]
    [InlineData("@username")]
    public void SlackSettings_WithValidChannel_ShouldAcceptValue(string channel)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            Channel = channel
        };

        // Assert
        settings.Channel.Should().Be(channel);
    }

    [Theory]
    [InlineData("https://api.taskmanager.com")]
    [InlineData("https://localhost:5001")]
    [InlineData("http://localhost:5000")]
    public void SlackSettings_WithValidBaseUrl_ShouldAcceptValue(string baseUrl)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            BaseUrl = baseUrl
        };

        // Assert
        settings.BaseUrl.Should().Be(baseUrl);
    }

    [Theory]
    [InlineData("https://app.taskmanager.com")]
    [InlineData("https://localhost:4200")]
    [InlineData("http://localhost:3000")]
    public void SlackSettings_WithValidClientBaseUrl_ShouldAcceptValue(string clientBaseUrl)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            ClientBaseUrl = clientBaseUrl
        };

        // Assert
        settings.ClientBaseUrl.Should().Be(clientBaseUrl);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void SlackSettings_WithEnableNotifications_ShouldAcceptValue(bool enableNotifications)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            EnableNotifications = enableNotifications
        };

        // Assert
        settings.EnableNotifications.Should().Be(enableNotifications);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void SlackSettings_WithEnableRetries_ShouldAcceptValue(bool enableRetries)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            EnableRetries = enableRetries
        };

        // Assert
        settings.EnableRetries.Should().Be(enableRetries);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void SlackSettings_WithValidMaxRetryAttempts_ShouldAcceptValue(int maxRetryAttempts)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            MaxRetryAttempts = maxRetryAttempts
        };

        // Assert
        settings.MaxRetryAttempts.Should().Be(maxRetryAttempts);
    }

    [Theory]
    [InlineData(100)]
    [InlineData(500)]
    [InlineData(1000)]
    [InlineData(5000)]
    public void SlackSettings_WithValidBaseRetryDelayMs_ShouldAcceptValue(int baseRetryDelayMs)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            BaseRetryDelayMs = baseRetryDelayMs
        };

        // Assert
        settings.BaseRetryDelayMs.Should().Be(baseRetryDelayMs);
    }

    [Theory]
    [InlineData(1000)]
    [InlineData(10000)]
    [InlineData(30000)]
    [InlineData(60000)]
    public void SlackSettings_WithValidMaxRetryDelayMs_ShouldAcceptValue(int maxRetryDelayMs)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            MaxRetryDelayMs = maxRetryDelayMs
        };

        // Assert
        settings.MaxRetryDelayMs.Should().Be(maxRetryDelayMs);
    }

    [Theory]
    [InlineData(5)]
    [InlineData(15)]
    [InlineData(30)]
    [InlineData(60)]
    [InlineData(120)]
    public void SlackSettings_WithValidRequestTimeoutSeconds_ShouldAcceptValue(int requestTimeoutSeconds)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            RequestTimeoutSeconds = requestTimeoutSeconds
        };

        // Assert
        settings.RequestTimeoutSeconds.Should().Be(requestTimeoutSeconds);
    }

    [Fact]
    public void SlackSettings_FullyConfigured_ShouldHaveAllPropertiesSet()
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            WebhookUrl = "https://hooks.slack.com/services/T123/B456/xyz",
            Channel = "#project-notifications",
            BaseUrl = "https://api.taskmanager.com",
            ClientBaseUrl = "https://app.taskmanager.com",
            EnableNotifications = true,
            EnableRetries = true,
            MaxRetryAttempts = 5,
            BaseRetryDelayMs = 500,
            MaxRetryDelayMs = 15000,
            RequestTimeoutSeconds = 45
        };

        // Assert
        settings.WebhookUrl.Should().Be("https://hooks.slack.com/services/T123/B456/xyz");
        settings.Channel.Should().Be("#project-notifications");
        settings.BaseUrl.Should().Be("https://api.taskmanager.com");
        settings.ClientBaseUrl.Should().Be("https://app.taskmanager.com");
        settings.EnableNotifications.Should().BeTrue();
        settings.EnableRetries.Should().BeTrue();
        settings.MaxRetryAttempts.Should().Be(5);
        settings.BaseRetryDelayMs.Should().Be(500);
        settings.MaxRetryDelayMs.Should().Be(15000);
        settings.RequestTimeoutSeconds.Should().Be(45);
    }

    [Fact]
    public void SlackSettings_WithDisabledConfiguration_ShouldWork()
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            EnableNotifications = false,
            EnableRetries = false,
            MaxRetryAttempts = 0
        };

        // Assert
        settings.EnableNotifications.Should().BeFalse();
        settings.EnableRetries.Should().BeFalse();
        settings.MaxRetryAttempts.Should().Be(0);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void SlackSettings_WithEmptyOrNullWebhookUrl_ShouldAcceptValue(string? webhookUrl)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            WebhookUrl = webhookUrl ?? string.Empty
        };

        // Assert
        settings.WebhookUrl.Should().Be(webhookUrl ?? string.Empty);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void SlackSettings_WithEmptyOrNullChannel_ShouldAcceptValue(string? channel)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            Channel = channel ?? string.Empty
        };

        // Assert
        settings.Channel.Should().Be(channel ?? string.Empty);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void SlackSettings_WithEmptyOrNullBaseUrl_ShouldAcceptValue(string? baseUrl)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            BaseUrl = baseUrl ?? string.Empty
        };

        // Assert
        settings.BaseUrl.Should().Be(baseUrl ?? string.Empty);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void SlackSettings_WithEmptyOrNullClientBaseUrl_ShouldAcceptValue(string? clientBaseUrl)
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            ClientBaseUrl = clientBaseUrl ?? string.Empty
        };

        // Assert
        settings.ClientBaseUrl.Should().Be(clientBaseUrl ?? string.Empty);
    }

    [Fact]
    public void SlackSettings_WithNegativeValues_ShouldAcceptValues()
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            MaxRetryAttempts = -1,
            BaseRetryDelayMs = -100,
            MaxRetryDelayMs = -1000,
            RequestTimeoutSeconds = -30
        };

        // Assert - The model itself doesn't validate, validation would be done elsewhere
        settings.MaxRetryAttempts.Should().Be(-1);
        settings.BaseRetryDelayMs.Should().Be(-100);
        settings.MaxRetryDelayMs.Should().Be(-1000);
        settings.RequestTimeoutSeconds.Should().Be(-30);
    }

    [Fact]
    public void SlackSettings_PropertyInitialization_ShouldWorkWithObjectInitializer()
    {
        // Arrange & Act
        var settings = new SlackSettings
        {
            WebhookUrl = "https://hooks.slack.com/services/test",
            EnableNotifications = false
        };

        // Assert
        settings.WebhookUrl.Should().Be("https://hooks.slack.com/services/test");
        settings.EnableNotifications.Should().BeFalse();
        
        // Other properties should have default values
        settings.Channel.Should().Be("#general");
        settings.EnableRetries.Should().BeTrue();
        settings.MaxRetryAttempts.Should().Be(3);
    }
}