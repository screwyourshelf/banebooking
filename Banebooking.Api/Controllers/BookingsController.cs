using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos.Booking;
using Banebooking.Api.Models;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bookinger")]
public class BookingerController : ControllerBase
{
    private readonly IBrukerService _brukerService;
    private readonly IBookingService _bookingService;

    public BookingerController(
        IBrukerService brukerService,
        IBookingService bookingService)
    {
        _brukerService = brukerService;
        _bookingService = bookingService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> HentBookinger(string slug, [FromQuery] Guid baneId, [FromQuery] DateOnly dato)
    {
        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(User);
        var slots = await _bookingService.HentBookingerAsync(slug, baneId, dato, bruker);
        return Ok(slots);
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(User);
        var resultat = await _bookingService.ForsøkOpprettBookingAsync(slug, dto, bruker);

        if (resultat.Status == "Feil")
            return BadRequest(resultat);

        return Ok(resultat);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> AvbestillBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(User);
        var resultat = await _bookingService.ForsøkAvbestillBookingAsync(slug, dto, bruker);

        if (resultat.Status == "Feil")
            return BadRequest(resultat);

        return Ok(resultat);
    }
}
