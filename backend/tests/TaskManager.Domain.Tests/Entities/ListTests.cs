using AutoFixture;
using FluentAssertions;
using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Tests.Entities;

public class ListTests
{
    private readonly Fixture _fixture;

    public ListTests()
    {
        _fixture = new Fixture();
    }

    [Fact]
    public void List_Creation_SetsDefaultValues()
    {
        // Act
        var list = new List();

        // Assert
        list.Id.Should().Be(Guid.Empty);
        list.Name.Should().BeEmpty();
        list.Position.Should().Be(0);
        list.BoardId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void List_SetValidProperties_Success()
    {
        // Arrange
        var list = new List();
        var name = _fixture.Create<string>();
        var position = _fixture.Create<int>();
        var boardId = _fixture.Create<Guid>();

        // Act
        list.Name = name;
        list.Position = position;
        list.BoardId = boardId;

        // Assert
        list.Name.Should().Be(name);
        list.Position.Should().Be(position);
        list.BoardId.Should().Be(boardId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void List_SetName_HandlesNullEmptyAndWhitespace(string? name)
    {
        // Arrange
        var list = new List();

        // Act & Assert - Should not throw
        list.Name = name ?? string.Empty;
        list.Name.Should().Be(name ?? string.Empty);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(-1)]
    [InlineData(int.MaxValue)]
    [InlineData(int.MinValue)]
    public void List_SetPosition_HandlesAllIntegerValues(int position)
    {
        // Arrange
        var list = new List();

        // Act
        list.Position = position;

        // Assert
        list.Position.Should().Be(position);
    }

    [Fact]
    public void List_NavigationProperties_InitializedCorrectly()
    {
        // Arrange & Act
        var list = new List();

        // Assert
        list.Board.Should().BeNull();
        list.Cards.Should().NotBeNull();
        list.Cards.Should().BeEmpty();
    }

    [Fact]
    public void List_SetBoardId_Success()
    {
        // Arrange
        var list = new List();
        var boardId = _fixture.Create<Guid>();

        // Act
        list.BoardId = boardId;

        // Assert
        list.BoardId.Should().Be(boardId);
    }

    [Fact]
    public void List_DefaultId_IsEmpty()
    {
        // Arrange & Act
        var list = new List();

        // Assert
        list.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void List_TwoInstances_HaveSameDefaultIds()
    {
        // Arrange & Act
        var list1 = new List();
        var list2 = new List();

        // Assert
        list1.Id.Should().Be(list2.Id);
        list1.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void List_WithValidData_IsValid()
    {
        // Arrange
        var name = "To Do";
        var position = 1;
        var boardId = Guid.NewGuid();

        // Act
        var list = new List
        {
            Name = name,
            Position = position,
            BoardId = boardId
        };

        // Assert
        list.Name.Should().Be(name);
        list.Position.Should().Be(position);
        list.BoardId.Should().Be(boardId);
        list.Id.Should().Be(Guid.Empty); // Will be set by application layer
    }
}