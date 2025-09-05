namespace TaskManager.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid GetCurrentUserId();
    bool IsAuthenticated { get; }
}