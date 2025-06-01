using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Klubb;
using Banebooking.Api.Models;
using Banebooking.Api.Tjenester;
using Microsoft.EntityFrameworkCore;

public interface IKlubbService
{
    Task<Klubb?> HentKlubbAsync(string slug);
    Task<bool> OppdaterKlubbAsync(string slug, OppdaterKlubbDto dto, Bruker bruker);
}

public class KlubbService : IKlubbService
{
    private readonly BanebookingDbContext _db;
    private readonly ICacheService _cache;

    public KlubbService(BanebookingDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<Klubb?> HentKlubbAsync(string slug)
    {
        var key = CacheKeys.Klubb(slug);

        var cached = _cache.Get<Klubb>(key);
        if (cached != null)
            return cached;

        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb != null)
        {
            _cache.Set(key, klubb);
        }

        return klubb;
    }

    public async Task<bool> OppdaterKlubbAsync(string slug, OppdaterKlubbDto dto, Bruker bruker)
    {
        var klubb = await _db.Klubber
            .Include(k => k.BookingRegel)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb == null) return false;

        klubb.Navn = dto.Navn;
        klubb.KontaktEpost = dto.KontaktEpost;
        klubb.Banereglement = dto.Banereglement;
        klubb.Latitude = dto.Latitude;
        klubb.Longitude = dto.Longitude;

        if (klubb.BookingRegel != null)
        {
            klubb.BookingRegel.MaksBookingerPerDagPerBruker = dto.BookingRegel.MaksPerDag;
            klubb.BookingRegel.MaksAntallBookingerPerBrukerTotalt = dto.BookingRegel.MaksTotalt;
            klubb.BookingRegel.AntallDagerFremITidTillatt = dto.BookingRegel.DagerFremITid;
            klubb.BookingRegel.SlotLengde = TimeSpan.FromMinutes(dto.BookingRegel.SlotLengdeMinutter);
        }

        await _db.SaveChangesAsync();

        _cache.Invalider(CacheKeys.Klubb(slug));

        return true;
    }
}
