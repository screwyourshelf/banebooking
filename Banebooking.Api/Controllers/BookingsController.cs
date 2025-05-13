using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Booking;
using Microsoft.EntityFrameworkCore;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public IActionResult HentBookinger([FromQuery] Guid baneId, [FromQuery] DateOnly dato)
    {
        // Mocket liste for 07:00–22:00
        var mock = new List<BookingSlotDto>();

        var brukere = new[]
        {
            (string?)null,
            null,
            "ola@eksempel.no",
            "kari@eksempel.no"
        };

        for (int time = 7; time < 22; time++)
        {
            mock.Add(new BookingSlotDto
            {
                StartTid = $"{time:00}:00",
                SluttTid = $"{time + 1:00}:00",
                BooketAv = brukere[Random.Shared.Next(brukere.Length)]
            });
        }
        return Ok(mock);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking([FromBody] NyBookingDto dto)
    {
        var bruker = await _brukerHjelper.HentEllerOpprettBrukerAsync(User);

        if (dto.Dato < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            return BadRequest(new { status = "Feil", melding = "Kan ikke booke tilbake i tid." });

        var bane = await _db.Baner
            .Include(b => b.Klubb)
            .ThenInclude(k => k.BookingRegel)
            .FirstOrDefaultAsync(b => b.Id == dto.BaneId);

        if (bane == null)
            return NotFound("Bane ikke funnet");

        var regel = bane.Klubb.BookingRegel;

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

        // Beregn brukt tid i minnet (siden vi ikke kan bruke DateDiffMinute i PostgreSQL)
        var dagensBookinger = await _db.Bookinger
            .Where(b => b.BrukerId == bruker.Id && b.Dato == dto.Dato && !b.Kansellert)
            .ToListAsync();

        var bruktTidIMinutter = dagensBookinger.Sum(b =>
            (b.SluttTid.ToTimeSpan() - b.StartTid.ToTimeSpan()).TotalMinutes);

        var ønsketTidIMinutter = (dto.SluttTid - dto.StartTid).TotalMinutes;

        if (bruktTidIMinutter + ønsketTidIMinutter > regel.MaksTimerPerDagPerBruker * 60)
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
