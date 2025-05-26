namespace Banebooking.Api.Dtos.Klubb
{
    public class BookingRegelDto
    {
        public int MaksPerDag { get; set; }
        public int MaksTotalt { get; set; }
        public int DagerFremITid { get; set; }
        public int SlotLengdeMinutter { get; set; }

        public string Aapningstid { get; set; } = "08:00";
        public string Stengetid { get; set; } = "22:00";
    }

}