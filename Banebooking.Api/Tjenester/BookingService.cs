using Banebooking.Api.Data;
using Banebooking.Api.Logikk;
using Banebooking.Api.Models;
using Banebooking.Api.Validering;
using Banebooking.Api.Autorisasjon;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Tjenester;

public interface IBookingService
{
    Task<List<BookingSlotDto>> HentBookingerAsync(string slug, Guid baneId, DateOnly dato, ClaimsPrincipal user);
    Task<BookingResultatDto> ForsøkOpprettBookingAsync(string slug, NyBookingDto dto, ClaimsPrincipal user);
    Task<BookingResultatDto> ForsøkAvbestillBookingAsync(string slug, NyBookingDto dto, ClaimsPrincipal user);

}


public class BookingService : IBookingService
{
    private readonly BanebookingDbContext _db;
    private readonly SlotBerikerMedVaer _beriker;
    private readonly IKlubbService _klubbService;
    private readonly BrukerService _brukerService;

    public BookingService(BanebookingDbContext db, SlotBerikerMedVaer beriker, IKlubbService klubbService)
    {
        _db = db;
        _beriker = beriker;
        _klubbService = klubbService;
        _brukerService = new BrukerService(db); // evt injiser denne også hvis ønskelig
    }

    public async Task<BookingResultatDto> ForsøkOpprettBookingAsync(string slug, NyBookingDto dto, ClaimsPrincipal user)
    {
        var klubb = await _klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return Feil("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return Feil("Bane ikke funnet");

        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(user);
        var regel = klubb.BookingRegel;

        var nå = DateTime.UtcNow;
        var iDag = DateOnly.FromDateTime(nå.Date);
        var nåTid = TimeOnly.FromDateTime(nå);

        var eksisterendeBookinger = await _db.Bookinger
            .Where(b => b.BrukerId == bruker.Id && b.Aktiv)
            .ToListAsync();

        var eksisterende = await _db.Bookinger
            .FirstOrDefaultAsync(b =>
                b.BaneId == dto.BaneId &&
                b.Dato == dto.Dato &&
                b.StartTid < dto.SluttTid &&
                b.SluttTid > dto.StartTid &&
                b.Aktiv);

        if (eksisterende != null)
            return Feil("Slot er allerede booket.");

        var ctx = new BookingContext
        {
            Bruker = bruker,
            Klubb = klubb,
            Bane = bane,
            Dato = dto.Dato,
            StartTid = dto.StartTid,
            SluttTid = dto.SluttTid,
            EksisterendeBooking = null,
            IDag = iDag,
            NåTid = nåTid,
            BookingerForBrukerIPeriode = eksisterendeBookinger
        };

        var regelMotor = new BookingRegelMotor(ctx);
        var vurdering = regelMotor.Evaluer();

        if (!vurdering.Gyldig)
        {
            var feilmelding = vurdering.Brudd.FirstOrDefault()?.Melding ?? "Booking ikke tillatt.";
            return Feil(feilmelding);
        }

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

        return new BookingResultatDto
        {
            Id = booking.Id,
            Status = "OK",
            Melding = "Booking registrert"
        };
    }

    public async Task<BookingResultatDto> ForsøkAvbestillBookingAsync(string slug, NyBookingDto dto, ClaimsPrincipal user)
    {
        var klubb = await _klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return Feil("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return Feil("Bane ikke funnet i klubben");

        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(user);
        var nå = DateTime.UtcNow;
        var iDag = DateOnly.FromDateTime(nå.Date);
        var nåTid = TimeOnly.FromDateTime(nå);

        var eksisterende = await _db.Bookinger
            .Include(b => b.Bruker)
            .FirstOrDefaultAsync(b =>
                b.BaneId == dto.BaneId &&
                b.Dato == dto.Dato &&
                b.StartTid == dto.StartTid &&
                b.SluttTid == dto.SluttTid &&
                b.Aktiv);

        if (eksisterende == null)
            return Feil("Fant ingen aktiv booking på sloten");

        var ctx = new BookingContext
        {
            Bruker = bruker,
            Klubb = klubb,
            Bane = bane,
            Dato = dto.Dato,
            StartTid = dto.StartTid,
            SluttTid = dto.SluttTid,
            EksisterendeBooking = eksisterende,
            IDag = iDag,
            NåTid = nåTid,
            BookingerForBrukerIPeriode = new List<Booking>() // ikke relevant for sletting
        };

        var autorisasjon = new BookingAutorisasjon(ctx).Evaluer();

        if (!autorisasjon.KanAvbestille)
            return Feil("Du har ikke tilgang til å avbestille denne bookingen.");

        eksisterende.Aktiv = false;
        await _db.SaveChangesAsync();

        return new BookingResultatDto
        {
            Status = "OK",
            Melding = "Booking avbestilt"
        };
    }

    public async Task<List<BookingSlotDto>> HentBookingerAsync(string slug, Guid baneId, DateOnly dato, ClaimsPrincipal user)
    {
        var klubb = await _klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            throw new Exception("Klubb ikke funnet"); // eller kast 404 i controlleren

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == baneId);
        if (bane == null)
            throw new Exception("Bane ikke funnet i klubben");

        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(user);
        var regel = klubb.BookingRegel;

        var nå = DateTime.UtcNow;
        var iDag = DateOnly.FromDateTime(nå.Date);
        var nåTid = TimeOnly.FromDateTime(nå);

        var eksisterendeBookinger = await _db.Bookinger
            .Include(b => b.Bruker)
            .Where(b => b.BaneId == bane.Id && b.Dato == dato && b.Aktiv)
            .ToListAsync();

        var bookingerForBruker = bruker?.Id != null
            ? await _db.Bookinger
                .Where(b => b.BrukerId == bruker.Id && b.Aktiv)
                .ToListAsync()
            : new List<Booking>();

        var slots = new List<BookingSlotDto>();

        for (var start = regel.Åpningstid; start < regel.Stengetid; start = start.Add(regel.SlotLengde))
        {
            var slutt = start.Add(regel.SlotLengde);
            var eksisterende = eksisterendeBookinger.FirstOrDefault(b => b.StartTid == start);

            var ctx = new BookingContext
            {
                Bruker = bruker,
                Klubb = klubb,
                Bane = bane,
                Dato = dato,
                StartTid = start,
                SluttTid = slutt,
                EksisterendeBooking = eksisterende,
                IDag = iDag,
                NåTid = nåTid,
                BookingerForBrukerIPeriode = bookingerForBruker
            };

            var regelmotor = new BookingRegelMotor(ctx);
            var regelresultat = regelmotor.Evaluer();

            var aksess = new BookingAutorisasjon(ctx).Evaluer();

            slots.Add(new BookingSlotDto
            {
                StartTid = $"{start:HH\\:mm}",
                SluttTid = $"{slutt:HH\\:mm}",
                BooketAv = aksess.BooketAv,
                KanBookes = aksess.KanBooke,
                KanAvbestille = aksess.KanAvbestille,
                KanSlette = aksess.KanSlette,
                VærSymbol = null,
                Temperatur = null,
                Vind = null
            });
        }

        await _beriker.BerikAsync(slots, klubb.Id, dato);
        return slots;
    }

    private static BookingResultatDto Feil(string melding) => new()
    {
        Status = "Feil",
        Melding = melding
    };
}