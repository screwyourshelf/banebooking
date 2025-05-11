namespace Banebooking.Api.Models;

public class BestemmelseForBooking
{
    public Guid KlubbId { get; set; }
    public Klubb Klubb { get; set; }

    public TimeOnly Åpningstid { get; set; } = new(7, 0);
    public TimeOnly Stengetid { get; set; } = new(22, 0);
    public int MaksTimerPerDagPerBruker { get; set; } = 2;

    public TimeSpan SlotLengde { get; set; } = TimeSpan.FromHours(1);
}