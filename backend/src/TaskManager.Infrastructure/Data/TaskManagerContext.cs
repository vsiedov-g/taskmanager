using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Data;

public class TaskManagerContext : DbContext
{
    public TaskManagerContext(DbContextOptions<TaskManagerContext> options) : base(options)
    {
    }

    // Core entities
    public DbSet<User> Users { get; set; }
    public DbSet<List> Lists { get; set; }
    public DbSet<Card> Cards { get; set; }
    public DbSet<ActivityLog> ActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        ApplyUserConfiguration(modelBuilder);
        ApplyListConfiguration(modelBuilder);
        ApplyCardConfiguration(modelBuilder);
        ApplyActivityLogConfiguration(modelBuilder);
    }

    private static void ApplyUserConfiguration(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });
    }

    private static void ApplyListConfiguration(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<List>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Position).IsRequired();
        });
    }

    private static void ApplyCardConfiguration(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Card>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.Priority).IsRequired();
            entity.Property(e => e.DueDate);
            entity.Property(e => e.Position).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Property(e => e.ProjectId);

            // Relationships
            entity.HasOne(e => e.List)
                  .WithMany(l => l.Cards)
                  .HasForeignKey(e => e.ListId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Assignee)
                  .WithMany()
                  .HasForeignKey(e => e.AssigneeId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ApplyActivityLogConfiguration(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.EntityId).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();

            // Relationships
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Card)
                  .WithMany(c => c.ActivityLogs)
                  .HasForeignKey(e => e.CardId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}