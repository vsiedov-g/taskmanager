namespace TaskManager.Application.Common.Models;

public class SlackNotificationResult
{
    public bool IsSuccess { get; set; }
    public string? MessageTs { get; set; }
    public string? ErrorMessage { get; set; }
    public int AttemptCount { get; set; }
    public TimeSpan ElapsedTime { get; set; }
    
    public static SlackNotificationResult Success(string messageTs, int attemptCount, TimeSpan elapsed) => 
        new() { IsSuccess = true, MessageTs = messageTs, AttemptCount = attemptCount, ElapsedTime = elapsed };
    
    public static SlackNotificationResult Failed(string error, int attemptCount, TimeSpan elapsed) => 
        new() { IsSuccess = false, ErrorMessage = error, AttemptCount = attemptCount, ElapsedTime = elapsed };
        
    public static SlackNotificationResult Skipped(string reason) => 
        new() { IsSuccess = false, ErrorMessage = reason, AttemptCount = 0, ElapsedTime = TimeSpan.Zero };
}