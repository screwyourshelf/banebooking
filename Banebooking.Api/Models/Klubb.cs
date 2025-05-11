namespace Banebooking.Api.Models;

public class Klubb
{
    public Guid Id { get; set; }
    public string Navn { get; set; }
    public string KontaktEpost { get; set; }
    public string AdminEpost { get; set; }

    public virtual ICollection<Bane> Baner { get; set; }
    public virtual BestemmelseForBooking BookingRegel { get; set; }
    public virtual ICollection<RolleITilgang> Roller { get; set; }
}