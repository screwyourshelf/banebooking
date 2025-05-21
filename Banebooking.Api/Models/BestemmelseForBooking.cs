namespace Banebooking.Api.Models;

public class BestemmelseForBooking
{
    public Guid KlubbId { get; set; }
    public Klubb Klubb { get; set; } = null!;

    public TimeOnly Åpningstid { get; set; } = new(7, 0);
    public TimeOnly Stengetid { get; set; } = new(22, 0);
    // Hvor langt frem i tid vanlige medlemmer får booke
    public int AntallDagerFremITidTillatt { get; set; } = 7;

    // Maksimalt antall aktive bookinger i hele perioden
    public int MaksAntallBookingerPerBrukerTotalt { get; set; } = 5;

    // Maksimalt antall aktive bookinger per dag
    public int MaksBookingerPerDagPerBruker { get; set; } = 2;

    public TimeSpan SlotLengde { get; set; } = TimeSpan.FromHours(1);
}
