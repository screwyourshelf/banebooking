using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bookinger")]
public class BookingerController(
    IBrukerService brukerService,
    IBookingService bookingService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> HentBookinger(string slug, [FromQuery] Guid baneId, [FromQuery] DateOnly dato)
    {
        var bruker = User.Identity?.IsAuthenticated == true
            ? await brukerService.HentEllerOpprettBrukerAsync(User)
            : null;

        var slots = await bookingService.HentBookingerAsync(slug, baneId, dato, bruker);
        return Ok(slots);
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> HentMineBookinger(string slug)
    {
        var bruker = User.Identity?.IsAuthenticated == true
            ? await brukerService.HentEllerOpprettBrukerAsync(User)
            : null;

        if (bruker == null)
            return Unauthorized("Bruker ikke autentisert eller token ugyldig.");

        var mineBookinger = await bookingService.HentBookingerAsync(slug, false, bruker);

        return Ok(mineBookinger);
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var bruker = User.Identity?.IsAuthenticated == true
            ? await brukerService.HentEllerOpprettBrukerAsync(User)
            : null;

        if (bruker == null)
            return Unauthorized("Bruker ikke autentisert eller token ugyldig.");

        var resultat = await bookingService.ForsøkOpprettBookingAsync(slug, dto, bruker);

        if (resultat.Status == "Feil")
            return BadRequest(resultat);

        return Ok(resultat);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> AvbestillBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var bruker = User.Identity?.IsAuthenticated == true
            ? await brukerService.HentEllerOpprettBrukerAsync(User)
            : null;

        if (bruker == null)
            return Unauthorized("Bruker ikke autentisert eller token ugyldig.");

        var resultat = await bookingService.ForsøkAvbestillBookingAsync(slug, dto, bruker);

        if (resultat.Status == "Feil")
            return BadRequest(resultat);

        return Ok(resultat);
    }
}
