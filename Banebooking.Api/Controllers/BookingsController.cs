using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Booking;
using Microsoft.EntityFrameworkCore;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bookinger")]
public class BookingerController : ControllerBase
{
    private readonly BrukerHjelper _brukerHjelper;
    private readonly BanebookingDbContext _db;

    public BookingerController(BanebookingDbContext db)
    {
        _brukerHjelper = new BrukerHjelper(db);
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> HentBookinger(
        string slug,
        [FromQuery] Guid baneId,
        [FromQuery] DateOnly dato)
    {
        // Hent klubb basert på slug
        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet");

        // Sjekk at banen tilhører klubben
        var bane = klubb.Baner.FirstOrDefault(b => b.Id == baneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i denne klubben");

        // Mock-data (bytt ut med ekte booking-henting etter behov)
        var mock = new List<BookingSlotDto>();
        var brukere = new[] { null, null, "ola@eksempel.no", "kari@eksempel.no" };

        var currentUserEmail = User.Identity?.Name?.ToLower() ?? "ola@eksempel.no";
        var erAdmin = currentUserEmail == klubb.AdminEpost?.ToLower();

        var nå = DateTime.UtcNow;
        var iDag = DateOnly.FromDateTime(nå.Date);
        var nåTid = TimeOnly.FromDateTime(nå);

        for (int time = 7; time < 22; time++)
        {
            var start = new TimeOnly(time, 0);
            var slutt = new TimeOnly(time + 1, 0);
            var booketAv = brukere[Random.Shared.Next(brukere.Length)];

            var erPassert = dato < iDag || (dato == iDag && start < nåTid);
            var erEier = booketAv != null &&
                         booketAv.Equals(currentUserEmail, StringComparison.OrdinalIgnoreCase);

            var slot = new BookingSlotDto
            {
                StartTid = $"{start:HH\\:mm}",
                SluttTid = $"{slutt:HH\\:mm}",
                BooketAv = booketAv,
                KanBookes = booketAv == null && !erPassert,
                KanAvbestille = booketAv != null && erEier && !erPassert,
                KanSlette = booketAv != null && !erEier && erAdmin && !erPassert,
                KanRapportereFravaer = booketAv != null && !erEier && erPassert
            };

            mock.Add(slot);
        }

        return Ok(mock);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking(
        string slug,
        [FromBody] NyBookingDto dto)
    {
        var bruker = await _brukerHjelper.HentEllerOpprettBrukerAsync(User);

        // Hent klubb basert på slug
        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet");

        // Sjekk at banen tilhører klubben
        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i denne klubben");

        var regel = klubb.BookingRegel;

        if (dto.Dato < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            return BadRequest(new { status = "Feil", melding = "Kan ikke booke tilbake i tid." });

        if (dto.StartTid < regel.Åpningstid || dto.SluttTid > regel.Stengetid)
            return BadRequest(new { status = "Feil", melding = "Tid utenfor åpningstid" });

        var eksisterende = await _db.Bookinger
            .AnyAsync(b =>
                b.BaneId == dto.BaneId &&
                b.Dato == dto.Dato &&
                b.StartTid < dto.SluttTid &&
                b.SluttTid > dto.StartTid &&
                !b.Kansellert);

        if (eksisterende)
            return Conflict(new { status = "Feil", melding = "Slot er allerede booket" });

        var dagensBookinger = await _db.Bookinger
            .Where(b => b.BrukerId == bruker.Id && b.Dato == dto.Dato && !b.Kansellert)
            .ToListAsync();

        var bruktTidIMinutter = dagensBookinger.Sum(b =>
            (b.SluttTid.ToTimeSpan() - b.StartTid.ToTimeSpan()).TotalMinutes);

        var ønsketTidIMinutter = (dto.SluttTid - dto.StartTid).TotalMinutes;

        if (bruktTidIMinutter + ønsketTidIMinutter > regel.MaksBookingerPerDagPerBruker * 60)
            return BadRequest(new { status = "Feil", melding = "Du har nådd maks tillatt tid for dagen" });

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BaneId = dto.BaneId,
            Dato = dto.Dato,
            StartTid = dto.StartTid,
            SluttTid = dto.SluttTid,
            BrukerId = bruker.Id,
            Type = BookingType.Medlem
        };

        _db.Bookinger.Add(booking);
        await _db.SaveChangesAsync();

        return Ok(new { id = booking.Id, status = "OK", melding = "Booking registrert" });
    }
}
