using Microsoft.Extensions.Logging;
using TaskManager.Application.Common.Models;

namespace TaskManager.Application.Common.Interfaces;

public interface ISlackRetryPolicy
{
    Task<SlackNotificationResult> ExecuteAsync(
        Func<Task<SlackNotificationResult>> operation,
        ILogger logger,
        CancellationToken cancellationToken = default);
}