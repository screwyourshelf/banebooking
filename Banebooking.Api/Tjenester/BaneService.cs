using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Bane;
using Banebooking.Api.Models;
using Banebooking.Api.Tjenester;
using Microsoft.EntityFrameworkCore;

public interface IBaneService
{
    Task<List<BaneDto>?> HentBanerForKlubbAsync(string slug, bool inkluderInaktive = false);
    Task<bool> OpprettBaneAsync(string slug, NyBaneDto dto);
    Task<bool> OppdaterBaneAsync(string slug, Guid baneId, OppdaterBaneDto dto);
    Task<bool> DeaktiverBaneAsync(string slug, Guid baneId);
    Task<bool> AktiverBaneAsync(string slug, Guid baneId);
}

public class BaneService : IBaneService
{
    private readonly BanebookingDbContext _db;
    private readonly ICacheService _cache;

    public BaneService(BanebookingDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<List<BaneDto>> HentBanerForKlubbAsync(string slug, bool inkluderInaktive = false)
    {
        var cached = _cache.Get<List<BaneDto>>("baner", slug, inkluderInaktive);
        if (cached != null)
            return cached;

        var query = _db.Baner.Where(b => b.Klubb.Slug == slug);

        if (!inkluderInaktive)
            query = query.Where(b => b.Aktiv);

        var baner = await query
            .OrderBy(b => b.Navn)
            .Select(b => new BaneDto
            {
                Id = b.Id,
                Navn = b.Navn,
                Beskrivelse = b.Beskrivelse,
                Aktiv = b.Aktiv
            })
            .ToListAsync();

        _cache.Set("baner", slug, baner, inkluderInaktive);
        return baner;
    }

    public async Task<bool> OpprettBaneAsync(string slug, NyBaneDto dto)
    {
        var klubb = await _db.Klubber.FirstOrDefaultAsync(k => k.Slug == slug);
        if (klubb == null)
            return false;

        var bane = new Bane
        {
            Id = Guid.NewGuid(),
            Navn = dto.Navn,
            Beskrivelse = dto.Beskrivelse,
            KlubbId = klubb.Id,
            Aktiv = true
        };

        _db.Baner.Add(bane);
        await _db.SaveChangesAsync();

        _cache.Invalider("baner", slug);
        return true;
    }

    public async Task<bool> OppdaterBaneAsync(string slug, Guid baneId, OppdaterBaneDto dto)
    {
        var bane = await _db.Baner
            .Include(b => b.Klubb)
            .FirstOrDefaultAsync(b => b.Id == baneId && b.Klubb.Slug == slug);

        if (bane == null)
            return false;

        bane.Navn = dto.Navn;
        bane.Beskrivelse = dto.Beskrivelse;

        await _db.SaveChangesAsync();
        _cache.Invalider("baner", slug);
        return true;
    }

    public async Task<bool> DeaktiverBaneAsync(string slug, Guid baneId)
    {
        var bane = await _db.Baner
            .Include(b => b.Klubb)
            .FirstOrDefaultAsync(b => b.Id == baneId && b.Klubb.Slug == slug);

        if (bane == null)
            return false;

        bane.Aktiv = false;
        await _db.SaveChangesAsync();

        _cache.Invalider("baner", slug);
        return true;
    }

    public async Task<bool> AktiverBaneAsync(string slug, Guid baneId)
    {
        var bane = await _db.Baner
            .Include(b => b.Klubb)
            .FirstOrDefaultAsync(b => b.Id == baneId && b.Klubb.Slug == slug);

        if (bane == null)
            return false;

        bane.Aktiv = true;
        await _db.SaveChangesAsync();

        _cache.Invalider("baner", slug);
        return true;
    }
}
