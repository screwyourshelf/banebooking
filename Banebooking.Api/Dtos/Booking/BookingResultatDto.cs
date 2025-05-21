namespace Banebooking.Api.Dtos.Booking;

public class BookingResultatDto
{
    public string Status { get; set; } = "OK";
    public string Melding { get; set; } = "";
    public Guid? Id { get; set; } // Settes kun ved vellykket oppretting
}