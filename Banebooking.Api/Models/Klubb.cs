using Banebooking.Api.Models;

public class Klubb
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Navn { get; set; } = string.Empty;

    public string Beskrivelse { get; set; } = string.Empty;

    public string Banereglement { get; set; } = string.Empty;

    public string KontaktEpost { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public string? FeedUrl { get; set; }

    public virtual BestemmelseForBooking BookingRegel { get; set; } = null!;
    public virtual ICollection<Bane> Baner { get; set; } = [];
    public virtual ICollection<BrukerRolle> Roller { get; set; } = [];
}
