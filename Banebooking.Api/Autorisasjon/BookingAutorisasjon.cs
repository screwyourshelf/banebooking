using Banebooking.Api.Logikk;
using Banebooking.Api.Models;

namespace Banebooking.Api.Autorisasjon;

/// <summary>
/// Resultatmodell for hvilke handlinger brukeren har tilgang til for en gitt slot.
/// </summary>
public class BookingAksessVurdering
{
    public bool KanBooke { get; set; }
    public bool KanAvbestille { get; set; }
    public bool KanSlette { get; set; }
    public bool ErEier { get; set; }
    public string? BooketAv { get; set; }
    public BookingType? Type { get; set; }
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
            Type = _ctx.EksisterendeBooking?.Type
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

