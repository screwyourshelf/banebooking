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
