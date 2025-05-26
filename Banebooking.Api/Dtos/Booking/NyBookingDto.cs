namespace Banebooking.Api.Dtos.Booking;

public class NyBookingDto
{
    public Guid BaneId { get; set; }
    public DateOnly Dato { get; set; }
    public TimeOnly StartTid { get; set; }
    public TimeOnly SluttTid { get; set; }

    public string? Type { get; set; }
    public string? Kommentar { get; set; }
}
