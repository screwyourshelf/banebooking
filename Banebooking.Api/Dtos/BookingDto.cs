namespace Banebooking.Api.Dto;

public class BookingDto
{
    public Guid Id { get; set; }
    public TimeOnly StartTid { get; set; }
    public TimeOnly SluttTid { get; set; }
    public string BaneNavn { get; set; } = string.Empty;
}
