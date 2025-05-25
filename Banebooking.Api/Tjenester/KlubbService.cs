using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Klubb;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

public interface IKlubbService
{
    Task<Klubb?> HentKlubbAsync(string slug);

    Task<bool> OppdaterKlubbAsync(string slug, OppdaterKlubbDto dto, Bruker bruker);

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

    public async Task<bool> OppdaterKlubbAsync(string slug, OppdaterKlubbDto dto, Bruker bruker)
    {
        var klubb = await HentKlubbAsync(slug);
        if (klubb == null) return false;

        if (!bruker.Epost.Equals(klubb.AdminEpost, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Bruker er ikke admin for klubben");

        klubb.Navn = dto.Navn;
        klubb.KontaktEpost = dto.KontaktEpost;
        klubb.Banereglement = dto.Banereglement;
        klubb.Latitude = dto.Latitude;
        klubb.Longitude = dto.Longitude;

        klubb.BookingRegel.MaksBookingerPerDagPerBruker = dto.BookingRegel.MaksPerDag;
        klubb.BookingRegel.MaksAntallBookingerPerBrukerTotalt = dto.BookingRegel.MaksTotalt;
        klubb.BookingRegel.AntallDagerFremITidTillatt = dto.BookingRegel.DagerFremITid;
        klubb.BookingRegel.SlotLengde = TimeSpan.FromMinutes(dto.BookingRegel.SlotLengdeMinutter);

        _db.Entry(klubb.BookingRegel).State = EntityState.Modified;
        await _db.SaveChangesAsync();

        // Fjern eventuell cache
        _cache.Remove($"klubb:{slug}:full");

        return true;
    }

}
