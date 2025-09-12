namespace TaskManager.Infrastructure.Tests.Integration;

/// <summary>
/// Integration test collection definition to ensure tests run sequentially
/// and don't interfere with each other's database or external service calls.
/// </summary>
[CollectionDefinition("Integration Tests")]
public class IntegrationTestCollection : ICollectionFixture<IntegrationTestFixture>
{
    // This class has no code, and is never created. Its purpose is simply
    // to be the place to apply [CollectionDefinition] and all the
    // ICollectionFixture<> interfaces.
}

/// <summary>
/// Shared fixture for integration tests that provides common setup/teardown.
/// </summary>
public class IntegrationTestFixture : IAsyncLifetime
{
    public IntegrationTestFixture()
    {
        // Any shared setup logic can go here
    }

    public Task InitializeAsync()
    {
        // Initialize any shared resources
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        // Cleanup any shared resources
        return Task.CompletedTask;
    }
}