namespace Banebooking.Api.Dtos;

public class BrukerDto
{
    public Guid Id { get; set; }
    public string Epost { get; set; } = string.Empty;

    // F.eks. ["Utvidet", "KlubbAdmin"]
    public List<string> Roller { get; set; } = new();
}
