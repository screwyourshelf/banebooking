using Banebooking.Api.Data;
using Banebooking.Api.Models;
using Banebooking.Api.Dtos.Booking;
using Banebooking.Api.Dtos.Arrangement;
using Microsoft.EntityFrameworkCore;

namespace Banebooking.Api.Tjenester;

public interface IArrangementService
{
    Task<List<ArrangementDto>> HentKommendeAktiveArrangementerAsync(Klubb klubb);
    Task<ArrangementForhandsvisningDto> GenererForhandsvisningAsync(Klubb klubb, OpprettArrangementDto dto, Bruker bruker);
    Task<ArrangementResponsDto> OpprettArrangementAsync(Klubb klubb, OpprettArrangementDto dto, Bruker bruker);
}

public class ArrangementService(
    BanebookingDbContext db,
    IKlubbService klubbService,
    ITidProvider tidProvider) : IArrangementService
{
    public async Task<List<ArrangementDto>> HentKommendeAktiveArrangementerAsync(Klubb klubb)
    {
        var nå = tidProvider.NåSnapshot().Nå;
        var dagensDato = DateOnly.FromDateTime(nå);
        var nåTid = TimeOnly.FromDateTime(nå);

        var arrangementer = await db.Arrangementer
            .Include(a => a.Bookinger)
                .ThenInclude(b => b.Bane)
            .Where(a =>
                a.KlubbId == klubb.Id &&
                a.Aktiv &&
                a.Bookinger.Any(b =>
                    b.Dato > dagensDato ||
                    (b.Dato == dagensDato && b.SluttTid > nåTid)))
            .ToListAsync();

        return arrangementer
            .Where(a => a.Bookinger.Any()) // Sikrer minst én booking
            .Select(a =>
            {
                var første = a.Bookinger
                    .OrderBy(b => b.Dato)
                    .ThenBy(b => b.StartTid)
                    .First();

                return new ArrangementDto
                {
                    Id = a.Id,
                    Tittel = a.Tittel,
                    Beskrivelse = a.Beskrivelse,
                    Kategori = a.Kategori,
                    StartDato = a.StartDato ?? første.Dato,
                    SluttDato = a.SluttDato ?? første.Dato,
                    FørsteBane = første.Bane.Navn,
                    FørsteStartTid = første.StartTid,
                    FørsteSluttTid = første.SluttTid,
                    AntallBookinger = a.Bookinger.Count
                };
            })
            .ToList();
    }


    public async Task<ArrangementForhandsvisningDto> GenererForhandsvisningAsync(Klubb klubb, OpprettArrangementDto dto, Bruker bruker)
    {
        var slotLengde = klubb.BookingRegel?.SlotLengde
            ?? throw new Exception("Slotlengde ikke satt for klubb");

        var resultat = new ArrangementForhandsvisningDto();

        var eksisterende = await db.Bookinger
            .Where(b =>
                b.Aktiv &&
                dto.BaneIder.Contains(b.BaneId) &&
                b.Dato >= dto.StartDato &&
                b.Dato <= dto.SluttDato)
            .Join(
                db.Baner.Where(b => b.KlubbId == klubb.Id),
                booking => booking.BaneId,
                bane => bane.Id,
                (booking, _) => booking
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

                        var booking = new NyBookingDto
                        {
                            BaneId = baneId,
                            Dato = current,
                            StartTid = start,
                            SluttTid = slutt,

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

    public async Task<ArrangementResponsDto> OpprettArrangementAsync(Klubb klubb, OpprettArrangementDto dto, Bruker bruker)
    {
        var resultat = new ArrangementResponsDto();

        var arrangement = new Arrangement
        {
            Id = Guid.NewGuid(),
            KlubbId = klubb.Id,
            OpprettetAvId = bruker.Id,
            Tittel = dto.Tittel ?? "Arrangement",
            Kategori = dto.Kategori,
            Beskrivelse = dto.Beskrivelse,
            StartDato = dto.StartDato,
            SluttDato = dto.SluttDato,
            Aktiv = true,
            OpprettetTid = DateTime.UtcNow
        };

        db.Arrangementer.Add(arrangement);

        var eksisterende = await db.Bookinger
            .Where(b =>
                b.Aktiv &&
                dto.BaneIder.Contains(b.BaneId) &&
                b.Dato >= dto.StartDato &&
                b.Dato <= dto.SluttDato)
            .Join(
                db.Baner.Where(b => b.KlubbId == klubb.Id),
                booking => booking.BaneId,
                bane => bane.Id,
                (booking, _) => booking
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
                        var slutt = tidspunkt.Add(klubb.BookingRegel.SlotLengde);

                        bool overlapp = eksisterende.Any(b =>
                            b.BaneId == baneId &&
                            b.Dato == current &&
                            b.StartTid == start);

                        if (overlapp)
                        {
                            resultat.Konflikter.Add(new ArrangementFeil
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
                            Arrangement = arrangement,
                        };

                        db.Bookinger.Add(booking);

                        resultat.Opprettet.Add(new BookingDto
                        {
                            Id = booking.Id,
                            BaneId = booking.BaneId,
                            Dato = booking.Dato,
                            StartTid = booking.StartTid,
                            SluttTid = booking.SluttTid,
                            Aktiv = booking.Aktiv,
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
