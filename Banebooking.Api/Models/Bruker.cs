namespace Banebooking.Api.Models;

public class Bruker
{
    public Guid Id { get; set; }
    public string Sub { get; set; } = string.Empty;
    public string Epost { get; set; } = string.Empty;
    public string? Navn { get; set; }

    public string? Merknad { get; set; }

    public string Provider { get; set; } = string.Empty;
    public DateTime OpprettetTid { get; set; } = DateTime.UtcNow;

    public virtual ICollection<Booking> Bookinger { get; set; } = [];

    public virtual ICollection<BrukerRolle> Roller { get; set; } = [];
}
