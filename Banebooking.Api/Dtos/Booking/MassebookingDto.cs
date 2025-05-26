namespace Banebooking.Api.Dtos.Booking;

public class MassebookingDto
{
    public DateOnly StartDato { get; set; }
    public DateOnly SluttDato { get; set; }

    public List<DayOfWeek> Ukedager { get; set; } = new();
    public List<TimeOnly> Tidspunkter { get; set; } = new();
    public List<Guid> BaneIder { get; set; } = new();

    public string Bookingtype { get; set; } = string.Empty;
    public string? Kommentar { get; set; }
}
