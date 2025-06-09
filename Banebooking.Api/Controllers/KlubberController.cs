using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Dtos.Klubb;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Models;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/")]
public partial class KlubberController(IKlubbService klubbService, IBrukerService brukerService) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<IActionResult> HentKlubb(string slug)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);

        if (klubb == null) return NotFound();

        var dto = new KlubbDetaljerDto
        {
            Slug = klubb.Slug,
            Navn = klubb.Navn,
            KontaktEpost = klubb.KontaktEpost,
            Banereglement = klubb.Banereglement,
            Latitude = klubb.Latitude,
            Longitude = klubb.Longitude,
            FeedUrl = klubb.FeedUrl,
            BookingRegel = new BookingRegelDto
            {
                MaksPerDag = klubb.BookingRegel?.MaksBookingerPerDagPerBruker ?? 1,
                MaksTotalt = klubb.BookingRegel?.MaksAntallBookingerPerBrukerTotalt ?? 2,
                DagerFremITid = klubb.BookingRegel?.AntallDagerFremITidTillatt ?? 7,
                SlotLengdeMinutter = (int)(klubb.BookingRegel?.SlotLengde.TotalMinutes ?? 60),
                Aapningstid = klubb.BookingRegel?.Åpningstid.ToString("HH\\:mm") ?? "07:00",  
                Stengetid = klubb.BookingRegel?.Stengetid.ToString("HH\\:mm") ?? "22:00" 
            }
        };

        return Ok(dto);
    }

    [Authorize]
    [HttpPut("{slug}")]
    public async Task<IActionResult> OppdaterKlubb(string slug, [FromBody] OppdaterKlubbDto dto)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);

        if (klubb == null) return NotFound();
        var bruker = User.Identity?.IsAuthenticated == true
                 ? await brukerService.HentEllerOpprettBrukerMedRolleAsync(klubb, User)
                 : null;

        if (bruker == null)
            return Unauthorized("Bruker ikke autentisert eller token ugyldig.");

        var erAdmin = bruker.Roller.Any(r =>
            r.KlubbId == klubb.Id &&
            r.Rolle == RolleType.KlubbAdmin);

        if (!erAdmin)
            return Forbid("Bruker er ikke klubbadministrator");

        var ok = await klubbService.OppdaterKlubbAsync(slug, dto, bruker);
        return ok ? NoContent() : NotFound();
    }
}
