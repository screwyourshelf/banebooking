using Banebooking.Api.Logikk;

namespace Banebooking.Api.Autorisasjon;

/// <summary>
/// Resultatmodell for hvilke handlinger brukeren har tilgang til for en gitt slot.
/// </summary>
/// <summary>
/// Resultatmodell for hvilke handlinger brukeren har tilgang til for en gitt booking-slot.
/// </summary>
public class BookingAksessVurdering
{
    public bool KanBooke { get; set; }             // Kan lage ny booking i dette slotet
    public bool KanAvbestille { get; set; }        // Kan avbestille egen booking
    public bool KanSlette { get; set; }            // Kan slette andres booking (admin)
    public bool ErEier { get; set; }               // Gjelder denne booking brukeren selv
    public string? BooketAv { get; set; }          // E-post (eller navn) på den som booket
}


public class BookingAutorisasjon
{
    private readonly BookingContext _ctx;

    public BookingAutorisasjon(BookingContext ctx)
    {
        _ctx = ctx;
    }

    private bool ErLedig => _ctx.EksisterendeBooking == null;
    private bool ErInnenforTid => !_ctx.SlotErPassert;
    private bool ErInnenFremITid => _ctx.Dato <= _ctx.IDag.AddDays(_ctx.Regel.AntallDagerFremITidTillatt);
    private bool HarBookingrett => _ctx.BrukerId != null;
    private bool UnderMaxPerDag => _ctx.AntallBookingerIDag < _ctx.Regel.MaksBookingerPerDagPerBruker;
    private bool UnderMaxTotalt => _ctx.AntallBookingerTotaltIPerioden < _ctx.Regel.MaksAntallBookingerPerBrukerTotalt;

    public BookingAksessVurdering Evaluer()
    {
        var vurdering = new BookingAksessVurdering
        {
            BooketAv = _ctx.EksisterendeBooking?.Bruker?.Epost,
            ErEier = _ctx.ErEier,
        };

        var harMedlemstilgang = ErLedig && ErInnenforTid && ErInnenFremITid && HarBookingrett && UnderMaxPerDag && UnderMaxTotalt;
        var harAdminTilgang = _ctx.ErAdmin && ErLedig && ErInnenforTid && HarBookingrett;

        vurdering.KanBooke = harMedlemstilgang || harAdminTilgang;

        vurdering.KanAvbestille =
            _ctx.EksisterendeBooking != null &&
            _ctx.ErEier &&
            ErInnenforTid;

        vurdering.KanSlette =
            _ctx.EksisterendeBooking != null &&
            !_ctx.ErEier &&
            _ctx.ErAdmin &&
            ErInnenforTid;

        return vurdering;
    }
}

