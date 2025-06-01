namespace Banebooking.Api.Models;

public class BrukerRolle
{
    public Guid Id { get; set; }

    public Guid KlubbId { get; set; }
    public Klubb Klubb { get; set; } = null!;

    public Guid BrukerId { get; set; }
    public Bruker Bruker { get; set; } = null!;

    public RolleType Rolle { get; set; }
}


public enum RolleType
{
    Medlem = 0,         // Kan booke og avbestille egne tider
    Utvidet = 1,        // + arrangement, fremtidige rettigheter
    KlubbAdmin = 2      // Full kontroll over klubbdata
}
