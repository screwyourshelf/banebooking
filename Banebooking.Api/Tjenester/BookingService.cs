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
    Task<List<BookingSlotDto>> HentBookingerAsync(string slug, Guid baneId, DateOnly dato, Bruker? bruker);
    Task<BookingResultatDto> ForsøkOpprettBookingAsync(string slug, NyBookingDto dto, Bruker bruker);
    Task<BookingResultatDto> ForsøkAvbestillBookingAsync(string slug, NyBookingDto dto, Bruker bruker);
    Task<List<BookingSlotDto>> HentBookingerAsync(string slug, bool inkluderHistoriske, Bruker bruker);

    Task<MassebookingForhandsvisningDto> GenererForhandsvisningAsync(string slug, MassebookingDto dto, Bruker bruker);
    Task<MassebookingResultatDto> OpprettMassebookingAsync(string slug, MassebookingDto dto, Bruker bruker);
}


public class BookingService(BanebookingDbContext db, SlotBerikerMedVaer beriker, IKlubbService klubbService, ITidProvider tidProvider) : IBookingService
{
    public async Task<BookingResultatDto> ForsøkOpprettBookingAsync(string slug, NyBookingDto dto, Bruker bruker)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return Feil("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return Feil("Bane ikke funnet");

        var regel = klubb.BookingRegel;

        var tidspunkt = tidProvider.NåSnapshot();

        var eksisterendeBookinger = await db.Bookinger
            .Include(b => b.Bane)
            .Where(b => b.BrukerId == bruker.Id && b.Aktiv && b.Bane.KlubbId == klubb.Id)
            .ToListAsync();

        var eksisterende = await db.Bookinger
            .Include(b => b.Bane)
            .FirstOrDefaultAsync(b =>
                b.BaneId == dto.BaneId &&
                b.Bane.KlubbId == klubb.Id && 
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

        db.Bookinger.Add(booking);
        await db.SaveChangesAsync();

        return new BookingResultatDto
        {
            Id = booking.Id,
            Status = "OK",
            Melding = "Booking registrert"
        };
    }

    public async Task<BookingResultatDto> ForsøkAvbestillBookingAsync(string slug, NyBookingDto dto, Bruker bruker)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return Feil("Klubb ikke funnet");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return Feil("Bane ikke funnet i klubben");

        var tidspunkt = tidProvider.NåSnapshot();

        var eksisterende = await db.Bookinger
         .Include(b => b.Bane)
         .FirstOrDefaultAsync(b =>
             b.BaneId == dto.BaneId &&
             b.Bane.KlubbId == klubb.Id &&
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
            BookingerForBrukerIPeriode = new List<Booking>()
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

    public async Task<List<BookingSlotDto>> HentBookingerAsync(string slug, Guid baneId, DateOnly dato, Bruker? bruker)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            throw new Exception("Klubb ikke funnet"); 

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == baneId);
        if (bane == null)
            throw new Exception("Bane ikke funnet i klubben");

        var regel = klubb.BookingRegel;
        var tidspunkt = tidProvider.NåSnapshot();

        var brukerId = bruker?.Id;

        var alleBookinger = await db.Bookinger
            .Include(b => b.Bruker)
            .Include(b => b.Bane)
            .Where(b => b.Aktiv && b.Bane.KlubbId == klubb.Id &&
                   ((b.BaneId == bane.Id && b.Dato == dato) || (brukerId != null && b.BrukerId == brukerId)))
            .ToListAsync();

        var eksisterendeBookinger = alleBookinger
            .Where(b => b.BaneId == bane.Id && b.Dato == dato)
            .ToList();

        var bookingerForBruker = brukerId != null
            ? alleBookinger.Where(b => b.BrukerId == brukerId).ToList()
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
                KanBookes = aksess.KanBooke,
                KanAvbestille = aksess.KanAvbestille,
                KanSlette = aksess.KanSlette,
                ErPassert = dato < tidspunkt.IDag || (dato == tidspunkt.IDag && slutt <= tidspunkt.NåTid),
                VærSymbol = null,
                Temperatur = null,
                Vind = null
            });
        }

        await beriker.BerikAsync(slots, klubb.Id, dato);
        return slots;
    }

    public async Task<List<BookingSlotDto>> HentBookingerAsync(string slug, bool inkluderHistoriske, Bruker bruker)
    {
        var klubb = await klubbService.HentKlubbAsync(slug)
            ?? throw new Exception("Klubb ikke funnet");

        var tidspunkt = tidProvider.NåSnapshot();
        var dagensDato = DateOnly.FromDateTime(tidspunkt.Nå);
        var nåTid = TimeOnly.FromDateTime(tidspunkt.Nå);

        var query = db.Bookinger 
            .Include(b => b.Bane)
            .Include(b => b.Bruker)
            .Where(b => b.BrukerId == bruker.Id && b.Aktiv && b.Bane.KlubbId == klubb.Id);

        if (!inkluderHistoriske)
        {
            query = query.Where(b => b.Dato > dagensDato ||
                                    (b.Dato == dagensDato && b.SluttTid > nåTid));
        }

        var bookinger = await query.ToListAsync();

        return [.. bookinger.Select(b => new BookingSlotDto
        {
            BaneId = b.BaneId.ToString(),
            BaneNavn = b.Bane.Navn,
            Dato = b.Dato.ToString("yyyy-MM-dd"),
            StartTid = $"{b.StartTid:HH\\:mm}",
            SluttTid = $"{b.SluttTid:HH\\:mm}",
            BooketAv = bruker.Navn,
            KanBookes = false, // N/A for MinSide
            KanAvbestille = b.Dato > dagensDato || (b.Dato == dagensDato && b.StartTid > nåTid),
            KanSlette = false, // kan legges til ved admin-rolle
            ErPassert = b.Dato < dagensDato || (b.Dato == dagensDato && b.SluttTid <= nåTid),
            VærSymbol = null,
            Temperatur = null,
            Vind = null
        })];
    }

    private static BookingResultatDto Feil(string melding) => new()
    {
        Status = "Feil",
        Melding = melding
    };

    public async Task<MassebookingForhandsvisningDto> GenererForhandsvisningAsync(string slug, MassebookingDto dto, Bruker bruker)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb?.BookingRegel?.SlotLengde == null)
            throw new Exception("Slotlengde ikke satt for klubb.");

        var slotLengde = klubb.BookingRegel.SlotLengde;

        var resultat = new MassebookingForhandsvisningDto();

        // Hent eksisterende bookinger for aktuelle baner og datoer, filtrert via klubben
        var eksisterende = await db.Bookinger
            .Where(b =>
                b.Aktiv &&
                dto.BaneIder.Contains(b.BaneId) &&
                b.Dato >= dto.StartDato &&
                b.Dato <= dto.SluttDato)
            .Join(
                db.Baner.Where(bane => bane.Klubb.Slug == slug),
                booking => booking.BaneId,
                bane => bane.Id,
                (booking, bane) => booking
            )
            .ToListAsync();

        // Generer potensielle bookinger
        var current = dto.StartDato;
        while (current <= dto.SluttDato)
        {
            if (dto.Ukedager.Contains(current.DayOfWeek))
            {
                foreach (var baneId in dto.BaneIder)
                {
                    foreach (var tidspunkt in dto.Tidspunkter)
                    {
                        var start = tidspunkt;
                        var slutt = tidspunkt.Add(slotLengde);

                        bool overlapp = eksisterende.Any(b =>
                            b.BaneId == baneId &&
                            b.Dato == current &&
                            b.StartTid == start);

                        var booking = new NyBookingDto
                        {
                            BaneId = baneId,
                            Dato = current,
                            StartTid = start,
                            SluttTid = slutt,
                            Type = dto.Bookingtype,
                            Kommentar = dto.Kommentar
                        };

                        if (overlapp)
                            resultat.Konflikter.Add(booking);
                        else
                            resultat.Ledige.Add(booking);
                    }
                }
            }

            current = current.AddDays(1);
        }

        return resultat;
    }

    public async Task<MassebookingResultatDto> OpprettMassebookingAsync(string slug, MassebookingDto dto, Bruker bruker)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb?.BookingRegel?.SlotLengde == null)
            throw new Exception("Slotlengde ikke satt for klubb.");

        var slotLengde = klubb.BookingRegel.SlotLengde;

        var resultat = new MassebookingResultatDto();

        // Hent eksisterende bookinger (samme som i forhåndsvisning)
        var eksisterende = await db.Bookinger
            .Where(b =>
                b.Aktiv &&
                dto.BaneIder.Contains(b.BaneId) &&
                b.Dato >= dto.StartDato &&
                b.Dato <= dto.SluttDato)
            .Join(
                db.Baner.Where(b => b.Klubb.Slug == slug),
                booking => booking.BaneId,
                bane => bane.Id,
                (booking, bane) => booking
            )
            .ToListAsync();

        var current = dto.StartDato;
        while (current <= dto.SluttDato)
        {
            if (dto.Ukedager.Contains(current.DayOfWeek))
            {
                foreach (var baneId in dto.BaneIder)
                {
                    foreach (var tidspunkt in dto.Tidspunkter)
                    {
                        var start = tidspunkt;
                        var slutt = tidspunkt.Add(slotLengde);

                        bool overlapp = eksisterende.Any(b =>
                            b.BaneId == baneId &&
                            b.Dato == current &&
                            b.StartTid == start);

                        if (overlapp)
                        {
                            resultat.Errors.Add(new MassebookingFeil
                            {
                                Dato = current,
                                Tid = start,
                                BaneId = baneId,
                                Feilmelding = "Allerede booket"
                            });
                            continue;
                        }

                        var booking = new Booking
                        {
                            Id = Guid.NewGuid(),
                            BaneId = baneId,
                            BrukerId = bruker.Id,
                            Dato = current,
                            StartTid = start,
                            SluttTid = slutt,
                            Aktiv = true,
                            Type = Enum.TryParse<BookingType>(dto.Bookingtype, ignoreCase: true, out var type) ? type : BookingType.Annet,
                            Kommentar = dto.Kommentar
                        };

                        db.Bookinger.Add(booking);

                        resultat.Vellykkede.Add(new BookingDto
                        {
                            Id = booking.Id,
                            BaneId = booking.BaneId,
                            Dato = booking.Dato,
                            StartTid = booking.StartTid,
                            SluttTid = booking.SluttTid,
                            Aktiv = booking.Aktiv,
                            Type = booking.Type.ToString(),
                            Kommentar = booking.Kommentar
                        });
                    }
                }
            }

            current = current.AddDays(1);
        }

        await db.SaveChangesAsync();
        return resultat;
    }

}