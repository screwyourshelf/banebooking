namespace Banebooking.Api.Dtos.Bane;

public class BaneDto
{
    public Guid Id { get; set; }
    public string Navn { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Beskrivelse { get; set; } = "";
}
