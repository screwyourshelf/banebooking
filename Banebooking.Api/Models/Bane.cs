namespace Banebooking.Api.Models;

public class Bane
{
    public Guid Id { get; set; }
    public Guid KlubbId { get; set; }

    public Klubb Klubb { get; set; } = null!;

    public string Navn { get; set; } = string.Empty;
    public string? Beskrivelse { get; set; }
    public bool Aktiv { get; set; } = true;

    public virtual ICollection<Booking> Bookinger { get; set; } = new List<Booking>();
}
