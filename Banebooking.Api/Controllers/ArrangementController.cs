using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos.Arrangement;
using System;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/arrangement")]
public class ArrangementController(
    IKlubbService klubbService,
    IBrukerService brukerService,
    IArrangementService arrangementService) : ControllerBase
{
    [HttpGet("kommende")]
    [AllowAnonymous]
    public async Task<IActionResult> HentKommendeArrangementer(string slug)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var arrangementer = await arrangementService.HentKommendeAktiveArrangementerAsync(klubb);

        return Ok(arrangementer);
    }

    [HttpPost("forhandsvis")]
    [Authorize]
    public async Task<IActionResult> Forhandsvis(string slug, [FromBody] OpprettArrangementDto dto)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User);
        if (bruker == null)
            return Unauthorized();

        var visning = await arrangementService.GenererForhandsvisningAsync(klubb, dto, bruker);
        return Ok(visning);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Opprett(string slug, [FromBody] OpprettArrangementDto dto)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User);
        if (bruker == null)
            return Unauthorized();

        var resultat = await arrangementService.OpprettArrangementAsync(klubb, dto, bruker);

        return Ok(resultat);
    }
}
