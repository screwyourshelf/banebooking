namespace Banebooking.Api.Models;

public class RapportertFravær
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }
    public Booking Booking { get; set; }

    public Guid RapportertAvBrukerId { get; set; }
    public Bruker RapportertAv { get; set; }

    public DateTime RapportertTidspunkt { get; set; } = DateTime.UtcNow;
    public string? Kommentar { get; set; }
}