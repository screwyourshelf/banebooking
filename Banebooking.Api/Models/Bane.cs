namespace Banebooking.Api.Models;

public class Bane
{
    public Guid Id { get; set; }
    public Guid KlubbId { get; set; }
    public Klubb Klubb { get; set; }

    public string Navn { get; set; }
    public string? Beskrivelse { get; set; }
    public bool Aktiv { get; set; } = true;

    public virtual ICollection<Booking> Bookinger { get; set; }
}