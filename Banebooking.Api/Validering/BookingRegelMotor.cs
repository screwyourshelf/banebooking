using Banebooking.Api.Logikk;

namespace Banebooking.Api.Validering;

/// <summary>
/// Evaluerer alle bookingregler for en spesifikk kontekst og returnerer eventuelle brudd.
/// </summary>
public class RegelEvalueringResultat
{
    public bool Gyldig => Brudd.Count == 0;
    public List<RegelBrudd> Brudd { get; } = new();
}

public class RegelBrudd
{
    public string Kode { get; init; } = "";
    public string Melding { get; init; } = "";
}

public class BookingRegelMotor
{
    private readonly BookingContext _ctx;

    public BookingRegelMotor(BookingContext ctx)
    {
        _ctx = ctx;
    }

    private bool SlotErPassert => _ctx.SlotErPassert;
    private bool ForLangtFremITid => _ctx.Dato > _ctx.IDag.AddDays(_ctx.Regel.AntallDagerFremITidTillatt);
    private bool TilbakeITid => _ctx.Dato < _ctx.IDag;
    private bool UtenforÅpningstid => _ctx.StartTid < _ctx.Regel.Åpningstid || _ctx.SluttTid > _ctx.Regel.Stengetid;

    private bool OverMaxPerDag => !_ctx.ErAdmin && _ctx.AntallBookingerIDag >= _ctx.Regel.MaksBookingerPerDagPerBruker;
    private bool OverMaxTotalt => !_ctx.ErAdmin && _ctx.AntallBookingerTotaltIPerioden >= _ctx.Regel.MaksAntallBookingerPerBrukerTotalt;

    public RegelEvalueringResultat Evaluer()
    {
        var resultat = new RegelEvalueringResultat();

        if (SlotErPassert)
            resultat.Brudd.Add(new RegelBrudd { Kode = "PASSERT", Melding = "Du kan ikke booke et tidspunkt som allerede er passert." });

        if (TilbakeITid)
            resultat.Brudd.Add(new RegelBrudd { Kode = "TILBAKE_I_TID", Melding = "Du kan ikke booke tilbake i tid." });

        if (ForLangtFremITid)
            resultat.Brudd.Add(new RegelBrudd
            {
                Kode = "FOR_LANGT_FREM",
                Melding = $"Du kan ikke booke mer enn {_ctx.Regel.AntallDagerFremITidTillatt} dager frem i tid."
            });

        if (UtenforÅpningstid)
            resultat.Brudd.Add(new RegelBrudd
            {
                Kode = "UTENFOR_AAPNINGSTID",
                Melding = $"Du må booke mellom {_ctx.Regel.Åpningstid} og {_ctx.Regel.Stengetid}."
            });

        if (OverMaxPerDag)
            resultat.Brudd.Add(new RegelBrudd
            {
                Kode = "MAKS_PER_DAG",
                Melding = $"Du har allerede {_ctx.AntallBookingerIDag} bookinger denne dagen."
            });

        if (OverMaxTotalt)
            resultat.Brudd.Add(new RegelBrudd
            {
                Kode = "MAKS_TOTALT",
                Melding = $"Du har allerede {_ctx.AntallBookingerTotaltIPerioden} aktive bookinger i perioden."
            });

        return resultat;
    }
}

