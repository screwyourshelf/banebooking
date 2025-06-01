using Banebooking.Api.Data;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;

public static class Testdata
{
    public static void Seed(BanebookingDbContext context)
    {
        var slug = "aas-tennisklubb";
        var adminEpost = "andreas.lotarev@gmail.com";

        // Opprett eller oppdater klubb
        var klubb = context.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefault(k => k.Slug == slug);

        if (klubb == null)
        {
            klubb = new Klubb
            {
                Id = Guid.NewGuid(),
                Slug = slug,
                Navn = "Ås tennisklubb",
                KontaktEpost = adminEpost,
                Latitude = 59.6552,
                Longitude = 10.7769,
                Banereglement = "... Reglement",
                BookingRegel = new BestemmelseForBooking
                {
                    Åpningstid = new TimeOnly(7, 0),
                    Stengetid = new TimeOnly(22, 0),
                    MaksBookingerPerDagPerBruker = 1,
                    AntallDagerFremITidTillatt = 7,
                    MaksAntallBookingerPerBrukerTotalt = 2,
                    SlotLengde = TimeSpan.FromMinutes(60),
                },
                Baner =
                [
                    new() { Id = Guid.NewGuid(), Navn = "Bane A", Beskrivelse = "Mot klubbhuset", Aktiv = true },
                    new() { Id = Guid.NewGuid(), Navn = "Bane B", Beskrivelse = "Midten", Aktiv = true },
                    new() { Id = Guid.NewGuid(), Navn = "Bane C", Beskrivelse = "Lengst bort", Aktiv = true },
                    new() { Id = Guid.NewGuid(), Navn = "Padel",  Beskrivelse = "Padelbane", Aktiv = false }
                ]
            };
            context.Klubber.Add(klubb);
            context.SaveChanges();
        }

        // Opprett eller hent bruker
        var bruker = context.Brukere.FirstOrDefault(b => b.Epost == adminEpost);
        if (bruker == null)
        {
            bruker = new Bruker
            {
                Id = Guid.NewGuid(),
                Epost = adminEpost,
                Navn = "Andreas Lotarev",
                Sub = "dev|andreas.lotarev",
                Provider = "email",
                OpprettetTid = DateTime.UtcNow
            };
            context.Brukere.Add(bruker);
            context.SaveChanges();
        }

        // Legg til roller om de mangler
        var eksisterendeRoller = context.Roller
            .Where(r => r.BrukerId == bruker.Id && r.KlubbId == klubb.Id)
            .Select(r => r.Rolle)
            .ToHashSet();

        if (!eksisterendeRoller.Contains(RolleType.KlubbAdmin))
        {
            context.Roller.Add(new BrukerRolle
            {
                Id = Guid.NewGuid(),
                BrukerId = bruker.Id,
                KlubbId = klubb.Id,
                Rolle = RolleType.KlubbAdmin
            });
        }

        context.SaveChanges();
    }
}
