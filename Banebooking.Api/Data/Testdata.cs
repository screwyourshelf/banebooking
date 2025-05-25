using Banebooking.Api.Data;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;

public static class Tesdata
{
    public static void Seed(BanebookingDbContext context)
    {
        var definertKlubb = new Klubb
        {
            Id = Guid.NewGuid(),
            Slug = "aas-tennisklubb",
            Navn = "Ås tennisklubb",
            KontaktEpost = "andreas.lotarev@gmail.com",
            AdminEpost = "andreas.lotarev@gmail.com",
            Longitude = 10.7769,
            Latitude = 59.6552,
            BookingRegel = new BestemmelseForBooking
            {
                Åpningstid = new TimeOnly(7, 0),
                Stengetid = new TimeOnly(22, 0),
                MaksBookingerPerDagPerBruker = 1,
                AntallDagerFremITidTillatt = 7,
                MaksAntallBookingerPerBrukerTotalt = 2,
                SlotLengde = TimeSpan.FromMinutes(60),
            },
            Banereglement = "... Reglement",
            Baner = new List<Bane>
        {
            new() { Id = Guid.NewGuid(), Navn = "Bane A", Beskrivelse = "Bane A - mot klubbhuset", Aktiv = true },
            new() { Id = Guid.NewGuid(), Navn = "Bane B", Beskrivelse = "Bane B - i mitten", Aktiv = true },
            new() { Id = Guid.NewGuid(), Navn = "Bane C", Beskrivelse = "Bane C - lengst bort fra klubbhuset", Aktiv = true },
            new() { Id = Guid.NewGuid(), Navn = "Padel",  Beskrivelse = "Padelbane", Aktiv = true }
        }
        };

        var eksisterende = context.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefault(k => k.Slug == definertKlubb.Slug);

        if (eksisterende == null)
        {
            context.Klubber.Add(definertKlubb);
        }
        else
        {
            // Oppdater klubbinfo
            eksisterende.Navn = definertKlubb.Navn;
            eksisterende.KontaktEpost = definertKlubb.KontaktEpost;
            eksisterende.AdminEpost = definertKlubb.AdminEpost;
            eksisterende.Latitude = definertKlubb.Latitude;
            eksisterende.Longitude = definertKlubb.Longitude;
            eksisterende.Banereglement = definertKlubb.Banereglement;

            // Bookingregel
            if (eksisterende.BookingRegel == null)
            {
                eksisterende.BookingRegel = definertKlubb.BookingRegel;
            }
            else
            {
                eksisterende.BookingRegel.Åpningstid = definertKlubb.BookingRegel.Åpningstid;
                eksisterende.BookingRegel.Stengetid = definertKlubb.BookingRegel.Stengetid;
                eksisterende.BookingRegel.MaksBookingerPerDagPerBruker = definertKlubb.BookingRegel.MaksBookingerPerDagPerBruker;
                eksisterende.BookingRegel.AntallDagerFremITidTillatt = definertKlubb.BookingRegel.AntallDagerFremITidTillatt;
                eksisterende.BookingRegel.MaksAntallBookingerPerBrukerTotalt = definertKlubb.BookingRegel.MaksAntallBookingerPerBrukerTotalt;
                eksisterende.BookingRegel.SlotLengde = definertKlubb.BookingRegel.SlotLengde;
            }

            // Oppdater eller legg til baner
            foreach (var definertBane in definertKlubb.Baner)
            {
                var eksisterendeBane = eksisterende.Baner
                    .FirstOrDefault(b => b.Navn.Equals(definertBane.Navn, StringComparison.OrdinalIgnoreCase));

                if (eksisterendeBane == null)
                {
                    eksisterende.Baner.Add(new Bane
                    {
                        Id = Guid.NewGuid(),
                        Navn = definertBane.Navn,
                        Beskrivelse = definertBane.Beskrivelse,
                        Aktiv = definertBane.Aktiv,
                        KlubbId = eksisterende.Id
                    });
                }
                else
                {
                    eksisterendeBane.Beskrivelse = definertBane.Beskrivelse;
                    eksisterendeBane.Aktiv = definertBane.Aktiv;
                }
            }
        }

        context.SaveChanges();
    }

}
