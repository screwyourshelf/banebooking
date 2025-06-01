namespace Banebooking.Api.Dtos.Arrangement;

public class ArrangementDto
{
    public Guid Id { get; set; }
    public string Tittel { get; set; } = string.Empty;
    public string? Beskrivelse { get; set; }
    public ArrangementKategori Kategori { get; set; }

    public DateOnly StartDato { get; set; }
    public DateOnly SluttDato { get; set; }

    // Presentasjonsformål – basert på første booking
    public string FørsteBane { get; set; } = string.Empty;
    public TimeOnly FørsteStartTid { get; set; }
    public TimeOnly FørsteSluttTid { get; set; }

    public int AntallBookinger { get; set; }
}
