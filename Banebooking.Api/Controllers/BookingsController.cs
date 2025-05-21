using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bookinger")]
public class BookingerController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingerController(
        IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> HentBookinger(string slug, [FromQuery] Guid baneId, [FromQuery] DateOnly dato)
    {
        var slots = await _bookingService.HentBookingerAsync(slug, baneId, dato, User);
        return Ok(slots);
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var resultat = await _bookingService.ForsøkOpprettBookingAsync(slug, dto, User);

        if (resultat.Status == "Feil")
            return BadRequest(resultat);

        return Ok(resultat);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> AvbestillBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var resultat = await _bookingService.ForsøkAvbestillBookingAsync(slug, dto, User);

        if (resultat.Status == "Feil")
            return BadRequest(resultat);

        return Ok(resultat);
    }
}
