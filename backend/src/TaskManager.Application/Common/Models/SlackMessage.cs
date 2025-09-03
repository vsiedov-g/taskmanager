namespace TaskManager.Application.Common.Models;

public class SlackMessage
{
    public string Text { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public object[]? Blocks { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}