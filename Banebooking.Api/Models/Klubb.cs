namespace Banebooking.Api.Models;

public class Klubb
{
    public Guid Id { get; set; }

    public string Navn { get; set; } = string.Empty;
    public string KontaktEpost { get; set; } = string.Empty;
    public string AdminEpost { get; set; } = string.Empty;

    public virtual ICollection<Bane> Baner { get; set; } = new List<Bane>();
    public virtual BestemmelseForBooking BookingRegel { get; set; } = null!;
    public virtual ICollection<RolleITilgang> Roller { get; set; } = new List<RolleITilgang>();
}
