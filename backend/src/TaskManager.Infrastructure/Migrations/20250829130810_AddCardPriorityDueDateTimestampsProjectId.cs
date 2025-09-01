using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCardPriorityDueDateTimestampsProjectId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new columns to existing Cards table
            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Cards", 
                type: "integer",
                nullable: false,
                defaultValue: 1); // Medium priority

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Cards",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Cards",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Cards",
                type: "timestamp with time zone", 
                nullable: false,
                defaultValue: new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId",
                table: "Cards",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the added columns
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Cards");
        }
    }
}
