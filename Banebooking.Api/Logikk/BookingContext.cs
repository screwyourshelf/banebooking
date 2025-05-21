using Banebooking.Api.Models;

namespace Banebooking.Api.Logikk;

/// <summary>
/// Samler all nødvendig kontekst for vurdering av bookingregler og autorisasjon.
/// </summary>
public class BookingContext
{
    public Bruker? Bruker { get; init; }
    public Guid? BrukerId => Bruker?.Id;

    public bool ErAdmin =>
    Bruker?.Epost != null &&
    Klubb?.AdminEpost != null &&
    Klubb.AdminEpost.Equals(Bruker.Epost, StringComparison.InvariantCultureIgnoreCase);

    public Klubb Klubb { get; init; } = null!;
    public BestemmelseForBooking Regel => Klubb.BookingRegel;

    public Bane Bane { get; init; } = null!;
    public DateOnly Dato { get; init; }
    public TimeOnly StartTid { get; init; }
    public TimeOnly SluttTid { get; init; }

    public DateOnly IDag { get; init; }
    public TimeOnly NåTid { get; init; }

    public Booking? EksisterendeBooking { get; init; }

    public bool SlotErPassert => Dato < IDag || (Dato == IDag && StartTid < NåTid);
    public bool ErEier => EksisterendeBooking?.BrukerId == Bruker?.Id;

    public List<Booking> BookingerForBrukerIPeriode { get; set; } = new();

    public int AntallBookingerTotaltIPerioden =>
    Bruker?.Id == null
        ? 0
        : BookingerForBrukerIPeriode.Count(b => b.Dato >= IDag && b.Dato <= IDag.AddDays(Regel.AntallDagerFremITidTillatt));

    public int AntallBookingerIDag =>
        Bruker?.Id == null
            ? 0
            : BookingerForBrukerIPeriode.Count(b => b.Dato == Dato);
}
