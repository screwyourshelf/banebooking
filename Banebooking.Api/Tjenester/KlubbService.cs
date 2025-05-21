using Banebooking.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

public interface IKlubbService
{
    Task<Klubb?> HentKlubbAsync(string slug);
}

public class KlubbService : IKlubbService
{
    private readonly BanebookingDbContext _db;
    private readonly IMemoryCache _cache;

    public KlubbService(BanebookingDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<Klubb?> HentKlubbAsync(string slug)
    {
        var key = $"klubb:{slug}:full";

        if (_cache.TryGetValue<Klubb>(key, out var cached))
            return cached;

        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb != null)
        {
            _cache.Set(key, klubb, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(6)
            });
        }

        return klubb;
    }
}
