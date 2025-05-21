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
                Navn = "Ås tennisklubb",
                Slug = "aas-tennisklubb",
                KontaktEpost = "andreas.lotarev@gmail.com",
                AdminEpost = "andreas.lotarev@vivende.no",
                Baner =
                [
                   new() { Id = Guid.NewGuid(), Navn = "Bane A", Beskrivelse = "Bane A - mot klubbhuset", Slug = "bane-a",  Aktiv = true },
                   new() { Id = Guid.NewGuid(), Navn = "Bane B", Beskrivelse = "Bane B - i mitten", Slug = "bane-b",  Aktiv = true },
                   new() { Id = Guid.NewGuid(), Navn = "Bane C", Beskrivelse = "Bane C - lengst bort fra klubbhuset", Slug = "bane-c",  Aktiv = true },
                   new() { Id = Guid.NewGuid(), Navn = "Padel", Beskrivelse = "Padelbane", Slug = "padel",  Aktiv = true }
                ],
                BookingRegel = new BestemmelseForBooking
                {
                    Åpningstid = new TimeOnly(7, 0),
                    Stengetid = new TimeOnly(22, 0),
                    MaksBookingerPerDagPerBruker = 2,
                    SlotLengde = TimeSpan.FromMinutes(60)
                },
                Longitude = 10.7769,
                Latitude = 59.6552,
            };

            foreach (var bane in klubb.Baner)
            {
                bane.KlubbId = klubb.Id;
                bane.Klubb = klubb;
            }

            context.Klubber.Add(klubb);

            context.SaveChanges();
        }
    }
}
