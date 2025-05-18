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

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> HentBookinger(
     string slug,
     [FromQuery] Guid baneId,
     [FromQuery] DateOnly dato)
    {
        // 1. Finn klubb inkl. bookingregler og baner
        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == baneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i klubben");

        var regel = klubb.BookingRegel;

        // 2. Hent bruker
        var bruker = await _brukerHjelper.HentEllerOpprettBrukerAsync(User);
        var brukerId = bruker?.Id;
        var brukerEpost = bruker?.Epost?.ToLowerInvariant();

        var erAdmin = brukerEpost != null && klubb.AdminEpost.ToLowerInvariant() == brukerEpost;

        // 3. Hent bookinger for banen og dato
        var bookinger = await _db.Bookinger
            .Include(b => b.Bruker)
            .Where(b => b.BaneId == baneId && b.Dato == dato && b.Aktiv)
            .ToListAsync();

        // 4. Tell antall bookinger brukeren allerede har for dagen
        var bookingerIDag = bookinger
            .Count(b => b.BrukerId == brukerId);

        // 5. Generér slots
        var nå = DateTime.UtcNow;
        var iDag = DateOnly.FromDateTime(nå.Date);
        var nåTid = TimeOnly.FromDateTime(nå);

        var slots = new List<BookingSlotDto>();
        for (var start = regel.Åpningstid; start < regel.Stengetid; start = start.Add(regel.SlotLengde))
        {
            var slutt = start.Add(regel.SlotLengde);
            var eksisterende = bookinger.FirstOrDefault(b => b.StartTid == start);

            var booketAv = eksisterende?.Bruker?.Epost;
            var erPassert = dato < iDag || (dato == iDag && start < nåTid);
            var erEier = eksisterende?.BrukerId == brukerId;

            slots.Add(new BookingSlotDto
            {
                StartTid = $"{start:HH\\:mm}",
                SluttTid = $"{slutt:HH\\:mm}",
                BooketAv = booketAv,

                KanBookes = eksisterende == null
                            && !erPassert
                            && brukerId != null
                            && bookingerIDag < regel.MaksBookingerPerDagPerBruker,

                KanAvbestille = eksisterende != null
                                && erEier
                                && !erPassert,

                KanSlette = eksisterende != null
                            && !erEier
                            && erAdmin
                            && !erPassert
            });
        }

        return Ok(slots);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var bruker = await _brukerHjelper.HentEllerOpprettBrukerAsync(User);

        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i denne klubben");

        var regel = klubb.BookingRegel;

        if (dto.Dato < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            return BadRequest(new { status = "Feil", melding = "Kan ikke booke tilbake i tid." });

        if (dto.StartTid < regel.Åpningstid || dto.SluttTid > regel.Stengetid)
            return BadRequest(new { status = "Feil", melding = "Tid utenfor åpningstid" });

        // Sjekk om det finnes en aktiv (ikke-kansellert) booking i det aktuelle tidsrommet
        var konflikt = await _db.Bookinger
            .AnyAsync(b =>
                b.BaneId == dto.BaneId &&
                b.Dato == dto.Dato &&
                b.StartTid < dto.SluttTid &&
                b.SluttTid > dto.StartTid &&
                b.Aktiv);

        if (konflikt)
            return Conflict(new { status = "Feil", melding = "Slot er allerede booket" });

        // Sjekk brukers daglige begrensning
        var dagensBookinger = await _db.Bookinger
            .Where(b => b.BrukerId == bruker.Id && b.Dato == dto.Dato && b.Aktiv)
            .ToListAsync();

        var bruktTidIMinutter = dagensBookinger.Sum(b =>
            (b.SluttTid.ToTimeSpan() - b.StartTid.ToTimeSpan()).TotalMinutes);
        var ønsketTidIMinutter = (dto.SluttTid - dto.StartTid).TotalMinutes;

        if (bruktTidIMinutter + ønsketTidIMinutter > regel.MaksBookingerPerDagPerBruker * 60)
            return BadRequest(new { status = "Feil", melding = "Du har nådd maks tillatt tid for dagen" });

        // Opprett ny booking
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BaneId = dto.BaneId,
            Dato = dto.Dato,
            StartTid = dto.StartTid,
            SluttTid = dto.SluttTid,
            BrukerId = bruker.Id,
            Type = BookingType.Medlem, 
            Aktiv = true,
        };

        _db.Bookinger.Add(booking);
        await _db.SaveChangesAsync();

        return Ok(new { id = booking.Id, status = "OK", melding = "Booking registrert" });
    }


    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> AvbestillBooking(
    string slug,
    [FromBody] NyBookingDto dto)
    {
        var bruker = await _brukerHjelper.HentEllerOpprettBrukerAsync(User);

        // Hent klubb og bane
        var klubb = await _db.Klubber
            .Include(k => k.Baner)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i klubben");

        // Finn eksisterende booking
        var eksisterende = await _db.Bookinger
            .Where(b =>
                b.BaneId == dto.BaneId &&
                b.Dato == dto.Dato &&
                b.StartTid == dto.StartTid &&
                b.SluttTid == dto.SluttTid &&
                b.Aktiv &&
                b.BrukerId == bruker.Id)
            .FirstOrDefaultAsync();

        if (eksisterende == null)
            return NotFound("Booking ikke funnet eller ikke eid av deg");

        eksisterende.Aktiv = false;
        await _db.SaveChangesAsync();

        return Ok(new { status = "OK", melding = "Booking avbestilt" });
    }

}
