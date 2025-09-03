using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Interfaces;

public interface IJoinCodeService
{
    string GenerateUniqueCode();
    Task<bool> IsCodeUniqueAsync(string code);
    Task<Board?> GetBoardByCodeAsync(string code);
}