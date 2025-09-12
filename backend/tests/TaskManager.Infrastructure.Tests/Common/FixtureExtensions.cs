using AutoFixture;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Tests.Common;

/// <summary>
/// AutoFixture extensions to handle Entity Framework navigation properties
/// and prevent circular dependency issues in unit tests.
/// </summary>
public static class FixtureExtensions
{
    /// <summary>
    /// Creates a fixture configured for Entity Framework entities.
    /// Prevents circular dependencies by omitting navigation properties.
    /// </summary>
    public static Fixture CreateEntityFixture()
    {
        var fixture = new Fixture();
        
        // Configure Card entity - omit navigation properties to prevent circular dependencies
        fixture.Customize<Card>(composer => composer
            .Without(c => c.List) // Navigation property
            .Without(c => c.Assignee) // Navigation property
            .Without(c => c.ActivityLogs) // Collection navigation property
        );
        
        // Configure List entity - omit navigation properties
        fixture.Customize<List>(composer => composer
            .Without(l => l.Board) // Navigation property
            .Without(l => l.Cards) // Collection navigation property
        );
        
        // Configure Board entity - omit navigation properties
        fixture.Customize<Board>(composer => composer
            .Without(b => b.Owner) // Navigation property
            .Without(b => b.Members) // Collection navigation property
            .Without(b => b.Lists) // Collection navigation property
        );
        
        // Configure BoardMember entity - omit navigation properties
        fixture.Customize<BoardMember>(composer => composer
            .Without(bm => bm.Board) // Navigation property
            .Without(bm => bm.User) // Navigation property
        );
        
        // Configure ActivityLog entity - omit navigation properties
        fixture.Customize<ActivityLog>(composer => composer
            .Without(al => al.User) // Navigation property
            .Without(al => al.Card) // Navigation property
        );
        
        return fixture;
    }
    
    /// <summary>
    /// Creates a fixture configured specifically for Slack-related tests.
    /// Includes common customizations for Slack testing scenarios.
    /// </summary>
    public static Fixture CreateSlackFixture()
    {
        var fixture = CreateEntityFixture();
        
        // Customize for Slack scenarios - ensure ActivityLog has required properties
        fixture.Customize<ActivityLog>(composer => composer
            .Without(al => al.User) // Navigation property
            .Without(al => al.Card) // Navigation property
            .With(al => al.Action, "CREATE") // Common Slack actions
            .With(al => al.EntityType, "Card")
            .With(al => al.Description, "Test activity log")
        );
        
        return fixture;
    }
}