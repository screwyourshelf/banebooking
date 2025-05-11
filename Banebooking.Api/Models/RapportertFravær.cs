namespace Banebooking.Api.Models;

public class RapportertFravær
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public Guid RapportertAvBrukerId { get; set; }
    public Bruker RapportertAv { get; set; } = null!;

    public DateTime RapportertTidspunkt { get; set; } = DateTime.UtcNow;
    public string? Kommentar { get; set; }
}
