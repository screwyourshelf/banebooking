namespace Banebooking.Api.Dtos.Booking;

public class BookingDto
{
    public Guid Id { get; set; }
    public DateOnly Dato { get; set; }
    public TimeOnly StartTid { get; set; }
    public TimeOnly SluttTid { get; set; }

    public Guid BaneId { get; set; }
    public string BaneNavn { get; set; } = string.Empty;

    public string Type { get; set; } = "";
    public string? Kommentar { get; set; }

    public bool Aktiv { get; set; }
}