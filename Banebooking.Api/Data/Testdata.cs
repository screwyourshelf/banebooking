using Banebooking.Api.Data;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;

public static class Tesdata
{
    public static void Seed(BanebookingDbContext context)
    {
        var definertKlubb = new Klubb
        {
            Slug = "aas-tennisklubb",
            Navn = "Ås tennisklubb",
            KontaktEpost = "andreas.lotarev@gmail.com",
            AdminEpost = "andreas.lotarev@vivende.no",
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
            Banereglement = """
            Det er kun betalende medlemmer som kan spille på banene.

            Prøvespill/gjestespill for ikke-medlemmer skal avtales på forhånd (mail til im@aastk.no). Baneleie = kr 200,- refunderes ved tegning av medlemskap.

            Baner skal vannes før bruk når grusen er tørr. Spill på tørr bane er forbudt! Se demovideo for bruk av vanningsanlegget.

            Av hensyn til naboer skal banen ikke benyttes før kl. 7.00 eller etter kl. 22.30.

            Hver spiller er begrenset til én bestilling per dag. Husk også å kansellere bestillingen i god tid!

            Styret har rett til å reservere alle baner ved trening, kurs, drop-in, arrangementer etc.

            Banene skal alltid kostes etter bruk – start ytterst langs gjerde og gå i sirkler mot midten.

            Bruk tennissko/joggesko med jevn såle! Fottøy med grov struktur ødelegger banen og er ikke tillatt!

            En bane regnes som spillbar dersom det ikke forekommer vanndammer.

            Alle medlemmer plikter å bidra med stell av linjer. Dersom en linje løsner skal den umiddelbart vannes og bankes ned i grusen med egen stamper. Det er viktig slik at den ikke løsner mer.

            Etterlat ikke drikkeflasker, tomme ballrør eller søppel på banen. Bidra til å holde anlegget ryddig og pent og bruk søppelkasser.

            De medlemmer som sist forlater baneanlegget om kvelden plikter å slå av banelyset, påse at døra til klubbhuset og port til bane er låst.

            Kontakt anleggsansvarlig om noe er galt med baner.
            """,
            Baner = new List<Bane>
            {
                new() { Slug = "bane-a", Navn = "Bane A", Beskrivelse = "Bane A - mot klubbhuset", Aktiv = true },
                new() { Slug = "bane-b", Navn = "Bane B", Beskrivelse = "Bane B - i mitten", Aktiv = true },
                new() { Slug = "bane-c", Navn = "Bane C", Beskrivelse = "Bane C - lengst bort fra klubbhuset", Aktiv = true },
                new() { Slug = "padel",  Navn = "Padel",  Beskrivelse = "Padelbane", Aktiv = true }
            }
        };

        var eksisterende = context.Klubber
            .Include(k => k.Baner)
            .Include(k => k.BookingRegel)
            .FirstOrDefault(k => k.Slug == definertKlubb.Slug);

        if (eksisterende == null)
        {
            definertKlubb.Id = Guid.NewGuid();
            foreach (var bane in definertKlubb.Baner)
                bane.Id = Guid.NewGuid();

            context.Klubber.Add(definertKlubb);
        }
        else
        {
            // Oppdater top-nivå
            eksisterende.Navn = definertKlubb.Navn;
            eksisterende.KontaktEpost = definertKlubb.KontaktEpost;
            eksisterende.AdminEpost = definertKlubb.AdminEpost;
            eksisterende.Longitude = definertKlubb.Longitude;
            eksisterende.Latitude = definertKlubb.Latitude;
            eksisterende.Banereglement = definertKlubb.Banereglement;

            // Oppdater bookingregel
            if (eksisterende.BookingRegel == null)
                eksisterende.BookingRegel = definertKlubb.BookingRegel;
            else
            {
                eksisterende.BookingRegel.Åpningstid = definertKlubb.BookingRegel.Åpningstid;
                eksisterende.BookingRegel.Stengetid = definertKlubb.BookingRegel.Stengetid;
                eksisterende.BookingRegel.MaksBookingerPerDagPerBruker = definertKlubb.BookingRegel.MaksBookingerPerDagPerBruker;
                eksisterende.BookingRegel.SlotLengde = definertKlubb.BookingRegel.SlotLengde;
            }

            // Oppdater eller legg til baner
            foreach (var definertBane in definertKlubb.Baner)
            {
                var eksisterendeBane = eksisterende.Baner.FirstOrDefault(b => b.Slug == definertBane.Slug);
                if (eksisterendeBane == null)
                {
                    eksisterende.Baner.Add(new Bane
                    {
                        Id = Guid.NewGuid(),
                        Slug = definertBane.Slug,
                        Navn = definertBane.Navn,
                        Beskrivelse = definertBane.Beskrivelse,
                        Aktiv = definertBane.Aktiv,
                        KlubbId = eksisterende.Id
                    });
                }
                else
                {
                    eksisterendeBane.Navn = definertBane.Navn;
                    eksisterendeBane.Beskrivelse = definertBane.Beskrivelse;
                    eksisterendeBane.Aktiv = definertBane.Aktiv;
                }
            }
        }

        context.SaveChanges();
    }
}
