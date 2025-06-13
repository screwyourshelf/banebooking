using Banebooking.Api.Data;
using Banebooking.Api.Logikk;
using Banebooking.Api.Models;
using Banebooking.Api.Validering;
using Banebooking.Api.Autorisasjon;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Tjenester;

public interface IBookingService
{
    Task<List<BookingSlotDto>> HentBookingerForDatoAsync(Klubb klubb, Bane bane, DateOnly dato, Bruker? bruker);
    Task<List<BookingSlotDto>> HentMineBookingerAsync(Klubb klubb, bool inkluderHistoriske, Bruker bruker);
    Task<BookingResultatDto> ForsøkOpprettBookingAsync(Klubb klubb, Bane bane, NyBookingDto dto, Bruker bruker);
    Task<BookingResultatDto> ForsøkAvbestillBookingAsync(Klubb klubb, Bane bane, NyBookingDto dto, Bruker bruker);
}



public class BookingService(BanebookingDbContext db, SlotBerikerMedVaer beriker, ITidProvider tidProvider) : IBookingService
{
    public async Task<BookingResultatDto> ForsøkOpprettBookingAsync(Klubb klubb, Bane bane, NyBookingDto dto, Bruker bruker)
    {
        var tidspunkt = tidProvider.NåSnapshot();

        var eksisterendeBookinger = await db.Bookinger
            .Include(b => b.Bane)
            .Where(b => b.BrukerId == bruker.Id && b.Aktiv && b.Bane.KlubbId == klubb.Id)
            .ToListAsync();

        var eksisterende = await db.Bookinger
            .Include(b => b.Bane)
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
            IDag = tidspunkt.IDag,
            NåTid = tidspunkt.NåTid,
            BookingerForBrukerIPeriode = eksisterendeBookinger
        };

        var vurdering = new BookingRegelMotor(ctx).Evaluer();
        if (!vurdering.Gyldig)
            return Feil(vurdering.Brudd.FirstOrDefault()?.Melding ?? "Booking ikke tillatt.");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BaneId = dto.BaneId,
            Dato = dto.Dato,
            StartTid = dto.StartTid,
            SluttTid = dto.SluttTid,
            BrukerId = bruker.Id,
            Aktiv = true
        };

        db.Bookinger.Add(booking);
        await db.SaveChangesAsync();

        return new BookingResultatDto
        {
            Id = booking.Id,
            Status = "OK",
            Melding = "Booking registrert"
        };
    }

    public async Task<BookingResultatDto> ForsøkAvbestillBookingAsync(Klubb klubb, Bane bane, NyBookingDto dto, Bruker bruker)
    {
        var tidspunkt = tidProvider.NåSnapshot();

        var eksisterende = await db.Bookinger
            .Include(b => b.Bane)
            .FirstOrDefaultAsync(b =>
                b.BaneId == dto.BaneId &&
                b.Dato == dto.Dato &&
                b.StartTid < dto.SluttTid &&
                b.SluttTid > dto.StartTid &&
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
            IDag = tidspunkt.IDag,
            NåTid = tidspunkt.NåTid,
            BookingerForBrukerIPeriode = []
        };

        var autorisasjon = new BookingAutorisasjon(ctx).Evaluer();
        if (!autorisasjon.KanAvbestille)
            return Feil("Du har ikke tilgang til å avbestille denne bookingen.");

        eksisterende.Aktiv = false;
        await db.SaveChangesAsync();

        return new BookingResultatDto
        {
            Status = "OK",
            Melding = "Booking avbestilt"
        };
    }

    public async Task<List<BookingSlotDto>> HentBookingerForDatoAsync(Klubb klubb, Bane bane, DateOnly dato, Bruker? bruker)
    {
        var tidspunkt = tidProvider.NåSnapshot();
        var brukerId = bruker?.Id;
        var regel = klubb.BookingRegel;

        var alleBookinger = await db.Bookinger
            .Include(b => b.Bruker)
            .Include(b => b.Bane)
            .Include(b => b.Arrangement)
            .Where(b => b.Aktiv &&
                        b.Bane.KlubbId == klubb.Id &&
                        ((b.BaneId == bane.Id && b.Dato == dato) ||
                         (brukerId != null && b.BrukerId == brukerId)))
            .ToListAsync();

        var eksisterendeBookinger = alleBookinger
            .Where(b => b.BaneId == bane.Id && b.Dato == dato)
            .ToList();

        var bookingerForBruker = brukerId != null
            ? alleBookinger.Where(b => b.BrukerId == brukerId && b.ArrangementId == null).ToList() // Vi unntar arrangement i beregningen
            : [];

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
                IDag = tidspunkt.IDag,
                NåTid = tidspunkt.NåTid,
                BookingerForBrukerIPeriode = bookingerForBruker
            };

            var regelmotor = new BookingRegelMotor(ctx);
            var regelresultat = regelmotor.Evaluer();

            var aksess = new BookingAutorisasjon(ctx).Evaluer();

            slots.Add(new BookingSlotDto
            {
                BaneId = eksisterende?.BaneId.ToString(),
                BaneNavn = eksisterende?.Bane?.Navn,
                Dato = dato.ToString("yyyy-MM-dd"),
                StartTid = $"{start:HH\\:mm}",
                SluttTid = $"{slutt:HH\\:mm}",
                BooketAv = eksisterende?.Bruker?.Epost,
                ArrangementTittel = eksisterende?.Arrangement?.Tittel,
                ArrangementBeskrivelse = eksisterende?.Arrangement?.Beskrivelse,
                KanBookes = aksess.KanBooke,
                KanAvbestille = aksess.KanAvbestille,
                KanSlette = aksess.KanSlette,
                ErPassert = dato < tidspunkt.IDag || (dato == tidspunkt.IDag && slutt <= tidspunkt.NåTid),
                VærSymbol = null,
                Temperatur = null,
                Vind = null
            });
        }

        await beriker.BerikAsync(slots, klubb, dato);

        return slots;
    }

    public async Task<List<BookingSlotDto>> HentMineBookingerAsync(Klubb klubb, bool inkluderHistoriske, Bruker bruker)
    {
        var tidspunkt = tidProvider.NåSnapshot();
        var dagensDato = DateOnly.FromDateTime(tidspunkt.Nå);
        var nåTid = TimeOnly.FromDateTime(tidspunkt.Nå);

        var query = db.Bookinger
            .Include(b => b.Bane)
            .Include(b => b.Bruker)
            .Where(b => b.BrukerId == bruker.Id &&
                        b.Aktiv &&
                        b.ArrangementId == null &&
                        b.Bane.KlubbId == klubb.Id);

        if (!inkluderHistoriske)
        {
            query = query.Where(b => b.Dato > dagensDato ||
                                     (b.Dato == dagensDato && b.SluttTid > nåTid));
        }

        var bookinger = await query.ToListAsync();

        return bookinger.Select(b => new BookingSlotDto
        {
            BaneId = b.BaneId.ToString(),
            BaneNavn = b.Bane.Navn,
            Dato = b.Dato.ToString("yyyy-MM-dd"),
            StartTid = $"{b.StartTid:HH\\:mm}",
            SluttTid = $"{b.SluttTid:HH\\:mm}",
            BooketAv = bruker.Epost,
            KanBookes = false,
            KanAvbestille = b.Dato > dagensDato || (b.Dato == dagensDato && b.StartTid > nåTid),
            KanSlette = false,
            ErPassert = b.Dato < dagensDato || (b.Dato == dagensDato && b.SluttTid <= nåTid),
            VærSymbol = null,
            Temperatur = null,
            Vind = null
        }).ToList();
    }

    private static BookingResultatDto Feil(string melding) => new()
    {
        Status = "Feil",
        Melding = melding
    };
}