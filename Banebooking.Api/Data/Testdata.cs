using Banebooking.Api.Data;
using Banebooking.Api.Models;

public static class Tesdata
{
    public static void Seed(BanebookingDbContext context)
    {
        if (!context.Klubber.Any())
        {
            var klubb = new Klubb
            {
                Id = Guid.NewGuid(),
                Navn = "Eksempel Tennisklubb",
                KontaktEpost = "kontakt@eksempelklubb.no",
                AdminEpost = "admin@eksempelklubb.no",
                Baner = new List<Bane>
                {
                    new() { Id = Guid.NewGuid(), Navn = "Bane 1", Aktiv = true },
                    new() { Id = Guid.NewGuid(), Navn = "Bane 2", Aktiv = true }
                },
                BookingRegel = new BestemmelseForBooking
                {
                    Åpningstid = new TimeOnly(7, 0),
                    Stengetid = new TimeOnly(22, 0),
                    MaksTimerPerDagPerBruker = 2,
                    SlotLengde = TimeSpan.FromMinutes(60)
                },
                Roller = new List<RolleITilgang>
                {
                    new() { Id = Guid.NewGuid(), Epost = "admin@eksempelklubb.no", Rolle = RolleType.Admin },
                    new() { Id = Guid.NewGuid(), Epost = "bruker@eksempelklubb.no", Rolle = RolleType.Medlem }
                }
            };

            context.Klubber.Add(klubb);

            // Opprett Brukere
            var bruker1 = new Bruker
            {
                Id = Guid.NewGuid(),
                Epost = "admin@eksempelklubb.no",
                LoginProvider = "local"
            };

            var bruker2 = new Bruker
            {
                Id = Guid.NewGuid(),
                Epost = "bruker@eksempelklubb.no",
                LoginProvider = "local"
            };

            context.Brukere.AddRange(bruker1, bruker2);

            // Bookinger
            var today = DateOnly.FromDateTime(DateTime.Today);
            context.Bookinger.Add(new Booking
            {
                Id = Guid.NewGuid(),
                Bane = klubb.Baner.First(),
                Bruker = bruker2,
                Dato = today,
                StartTid = new TimeOnly(17, 0),
                SluttTid = new TimeOnly(18, 0),
                Type = BookingType.Medlem
            });

            context.SaveChanges();
        }
    }
}
