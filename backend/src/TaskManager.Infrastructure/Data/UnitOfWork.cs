using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly TaskManagerContext _context;
    private bool _disposed = false;

    public UnitOfWork(TaskManagerContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _context.Dispose();
        }
        _disposed = true;
    }
}