namespace Banebooking.Api.Models;

public class RolleITilgang
{
    public Guid Id { get; set; }
    public Guid KlubbId { get; set; }
    public string Epost { get; set; }
    public RolleType Rolle { get; set; }

    public Klubb Klubb { get; set; }
}

public enum RolleType
{
    Medlem = 0,
    Admin = 1,
    KanMassebooke = 2,
    Superadmin = 3
}