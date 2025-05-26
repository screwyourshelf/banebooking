using Banebooking.Api.Dtos.Booking;

public class MassebookingResultatDto
{
    public List<BookingDto> Vellykkede { get; set; } = new();
    public List<MassebookingFeil> Errors { get; set; } = new();
}

public class MassebookingFeil
{
    public DateOnly Dato { get; set; }
    public TimeOnly Tid { get; set; }
    public Guid BaneId { get; set; }
    public string Feilmelding { get; set; } = "";
}

