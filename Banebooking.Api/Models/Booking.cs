namespace Banebooking.Api.Models;

public class Booking
{
    public Guid Id { get; set; }

    public Guid BaneId { get; set; }
    public Bane Bane { get; set; } = null!;

    public Guid? BrukerId { get; set; }
    public Bruker? Bruker { get; set; }

    public DateOnly Dato { get; set; }
    public TimeOnly StartTid { get; set; }
    public TimeOnly SluttTid { get; set; }

    public BookingType Type { get; set; }
    public bool Aktiv { get; set; }
    public DateTime? KansellertTidspunkt { get; set; }
    public string? KansellertAv { get; set; }
    public bool VarsletOmKansellering { get; set; }
    public string? Kommentar { get; set; }
}

public enum BookingType
{
    Medlem = 0,
    Turnering = 1,
    Kurs = 2,
    Annet = 3
}
