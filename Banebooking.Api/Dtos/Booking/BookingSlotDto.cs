namespace Banebooking.Api.Dtos.Booking;

public class BookingSlotDto
{
    public string StartTid { get; set; } = null!;
    public string SluttTid { get; set; } = null!;
    public string? BooketAv { get; set; }
}
