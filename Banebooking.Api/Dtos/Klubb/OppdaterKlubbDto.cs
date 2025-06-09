namespace Banebooking.Api.Dtos.Klubb;

public class OppdaterKlubbDto
{
    public string Navn { get; set; } = string.Empty;
    public string KontaktEpost { get; set; } = string.Empty;
    public string Banereglement { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public string? FeedUrl { get; set; }

    public BookingRegelDto BookingRegel { get; set; } = new();
}