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

    public bool Aktiv { get; set; }

    public Guid? ArrangementId { get; set; }
    public Arrangement? Arrangement { get; set; }

}
