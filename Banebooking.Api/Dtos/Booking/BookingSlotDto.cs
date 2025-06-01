namespace Banebooking.Api.Dtos.Booking;

public class BookingSlotDto
{
    public string BaneNavn { get; set; }
    public string BaneId { get; set; }
    public string Dato { get; set; }
    public string StartTid { get; set; }
    public string SluttTid { get; set; }
    public string? BooketAv { get; set; }
    public string? ArrangementTittel { get; set; }
    public string? ArrangementBeskrivelse { get; set; }

    public bool KanBookes { get; set; }
    public bool KanAvbestille { get; set; }
    public bool KanSlette { get; set; }

    public bool ErPassert { get; set; }

    public string? VærSymbol { get; set; }
    public double? Temperatur { get; set; }
    public double? Vind { get; set; }
}
