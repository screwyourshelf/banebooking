namespace Banebooking.Api.Dtos.Arrangement;

public class OpprettArrangementDto
{
    public string Tittel { get; set; } = string.Empty;
    public string? Beskrivelse { get; set; }

    public ArrangementKategori Kategori { get; set; } = ArrangementKategori.Annet;

    public DateOnly StartDato { get; set; }
    public DateOnly SluttDato { get; set; }

    public List<DayOfWeek> Ukedager { get; set; } = [];
    public List<TimeOnly> Tidspunkter { get; set; } = [];
    public List<Guid> BaneIder { get; set; } = [];
}
