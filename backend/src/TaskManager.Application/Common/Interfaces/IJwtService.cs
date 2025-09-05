using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    Guid? ValidateToken(string token);
}