using Banebooking.Api.Models;
using System.ComponentModel.DataAnnotations;

public class Arrangement
{
    public Guid Id { get; set; }

    public Guid KlubbId { get; set; }
    public Klubb Klubb { get; set; } = null!;

    public Guid OpprettetAvId { get; set; }
    public Bruker OpprettetAv { get; set; } = null!;

    [MaxLength(100)]
    public string Tittel { get; set; } = string.Empty;
    public string? Beskrivelse { get; set; }

    public DateOnly? StartDato { get; set; }
    public DateOnly? SluttDato { get; set; }

    public ArrangementKategori Kategori { get; set; } = ArrangementKategori.Annet;

    public DateTime OpprettetTid { get; set; } = DateTime.UtcNow;

    public bool Aktiv { get; set; } = true;

    public virtual ICollection<Booking> Bookinger { get; set; } = [];
}


public enum ArrangementKategori
{
    Trening,
    Turnering,
    Klubbmersterskap,
    Kurs,
    Lagkamp,
    Stigespill,
    Dugnad,
    Vedlikehold,
    Sosialt,
    Annet
}
