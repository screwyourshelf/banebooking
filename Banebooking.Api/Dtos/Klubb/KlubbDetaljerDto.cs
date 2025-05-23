namespace Banebooking.Api.Dtos.Klubb
{
    public class KlubbDetaljerDto
    {
        public string Slug { get; set; } = default!;
        public string Navn { get; set; } = default!;
        public string? KontaktEpost { get; set; }
        public string? Banereglement { get; set; }

        public BookingRegelDto BookingRegel { get; set; } = default!;
    }

}