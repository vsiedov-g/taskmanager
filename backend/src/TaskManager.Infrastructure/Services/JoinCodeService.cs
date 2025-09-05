using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Services;

public class JoinCodeService : IJoinCodeService
{
    private readonly IBoardRepository _boardRepository;
    private const string CodeCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int CodeLength = 6;

    public JoinCodeService(IBoardRepository boardRepository)
    {
        _boardRepository = boardRepository;
    }

    public string GenerateUniqueCode()
    {
        var random = new Random();
        string code;
        
        do
        {
            code = new string(Enumerable.Range(0, CodeLength)
                .Select(_ => CodeCharacters[random.Next(CodeCharacters.Length)])
                .ToArray());
        }
        while (!_boardRepository.IsJoinCodeUniqueAsync(code).Result);

        return code;
    }

    public async Task<bool> IsCodeUniqueAsync(string code)
    {
        return await _boardRepository.IsJoinCodeUniqueAsync(code);
    }

    public async Task<Board?> GetBoardByCodeAsync(string code)
    {
        return await _boardRepository.GetByJoinCodeAsync(code);
    }
}