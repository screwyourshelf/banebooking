using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Dtos.Arrangement;

public class ArrangementResponsDto
{
    public List<BookingDto> Opprettet { get; set; } = new();
    public List<ArrangementFeil> Konflikter { get; set; } = new();
}

public class ArrangementFeil
{
    public DateOnly Dato { get; set; }
    public TimeOnly Tid { get; set; }
    public Guid BaneId { get; set; }
    public string Feilmelding { get; set; } = "";
}

