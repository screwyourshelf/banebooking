using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Dtos.Klubb;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;

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
            AdminEpost = klubb.AdminEpost,
            Banereglement = klubb.Banereglement,
            Latitude = klubb.Latitude,
            Longitude = klubb.Longitude,
            BookingRegel = new BookingRegelDto
            {
                MaksPerDag = klubb.BookingRegel?.MaksBookingerPerDagPerBruker ?? 1,
                MaksTotalt = klubb.BookingRegel?.MaksAntallBookingerPerBrukerTotalt ?? 2,
                DagerFremITid = klubb.BookingRegel?.AntallDagerFremITidTillatt ?? 7,
                SlotLengdeMinutter = (int)(klubb.BookingRegel?.SlotLengde.TotalMinutes ?? 60)
            }
        };

        return Ok(dto);
    }

    [Authorize]
    [HttpPut("{slug}")]
    public async Task<IActionResult> OppdaterKlubb(string slug, [FromBody] OppdaterKlubbDto dto)
    {
        var bruker = User.Identity?.IsAuthenticated == true
                 ? await brukerService.HentEllerOpprettBrukerAsync(User)
                 : null;

        if (bruker == null)
            return Unauthorized("Bruker ikke autentisert eller token ugyldig.");
        
        try
        {
            var ok = await klubbService.OppdaterKlubbAsync(slug, dto, bruker);
            return ok ? NoContent() : NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

}
