using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Bane;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;


public interface IBaneService
{
    Task<List<BaneDto>> HentBanerForKlubbAsync(string slug);
}

public class BaneService : IBaneService
{
    private readonly BanebookingDbContext _db;
    private readonly IMemoryCache _cache;

    public BaneService(BanebookingDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<List<BaneDto>?> HentBanerForKlubbAsync(string slug)
    {
        var cacheKey = $"baner:{slug}";

        if (_cache.TryGetValue(cacheKey, out List<BaneDto> cached))
            return cached;

        var klubbFinnes = await _db.Klubber.AnyAsync(k => k.Slug == slug);
        if (!klubbFinnes)
            return null;

        var baner = await _db.Baner
            .Where(b => b.Aktiv && b.Klubb.Slug == slug)
            .OrderBy(b => b.Navn)
            .Select(b => new BaneDto
            {
                Id = b.Id,
                Navn = b.Navn,
                Slug = b.Slug,
                Beskrivelse = b.Beskrivelse
            })
            .ToListAsync();

        _cache.Set(cacheKey, baner, TimeSpan.FromHours(6));
        return baner;
    }
}
