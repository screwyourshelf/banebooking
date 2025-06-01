using Banebooking.Api.Dtos.Booking;

public class ArrangementForhandsvisningDto
{
    public List<NyBookingDto> Ledige { get; set; } = new();
    public List<NyBookingDto> Konflikter { get; set; } = new();
}
