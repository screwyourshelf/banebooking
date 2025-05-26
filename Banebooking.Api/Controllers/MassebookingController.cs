using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/massebooking")]
public class MassebookingController(
    IBrukerService brukerService,
    IBookingService bookingService) : ControllerBase
{
    [HttpPost("forhandsvis")]
    [Authorize]
    public async Task<IActionResult> Forhandsvis(string slug, [FromBody] MassebookingDto dto)
    {
        var bruker = await brukerService.HentEllerOpprettBrukerAsync(User);
        if (bruker == null)
            return Unauthorized();

        var visning = await bookingService.GenererForhandsvisningAsync(slug, dto, bruker);
        return Ok(visning);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Opprett(string slug, [FromBody] MassebookingDto dto)
    {
        var bruker = await brukerService.HentEllerOpprettBrukerAsync(User);
        if (bruker == null)
            return Unauthorized();

        var resultat = await bookingService.OpprettMassebookingAsync(slug, dto, bruker);

        return resultat.Errors.Count > 0
            ? BadRequest(resultat)
            : Ok(resultat);
    }
}
