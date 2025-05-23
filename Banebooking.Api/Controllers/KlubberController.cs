using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Dtos.Klubb;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/")]
public class KlubberController(IKlubbService _klubbService) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<IActionResult> HentKlubb(string slug)
    {
        var klubb = await _klubbService.HentKlubbAsync(slug);

        if (klubb == null) return NotFound();

        var dto = new KlubbDetaljerDto
        {
            Slug = klubb.Slug,
            Navn = klubb.Navn,
            KontaktEpost = klubb.KontaktEpost,
            Banereglement = klubb.Banereglement,
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
}
