public class BookingSlotDto
{
    public string StartTid { get; set; }
    public string SluttTid { get; set; }
    public string? BooketAv { get; set; }

    public bool KanBookes { get; set; }
    public bool KanAvbestille { get; set; }
    public bool KanSlette { get; set; }
    public bool KanRapportereFravaer { get; set; }
}
