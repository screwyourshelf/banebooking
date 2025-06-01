using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Dtos.Booking;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Data;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bookinger")]
public class BookingerController(
    BanebookingDbContext db,
    IKlubbService klubbService,
    IBrukerService brukerService,
    IBookingService bookingService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> HentBookinger(string slug, [FromQuery] Guid baneId, [FromQuery] DateOnly dato)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == baneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i klubben.");

        var bruker = User.Identity?.IsAuthenticated == true
            ? await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User)
            : null;

        var slots = await bookingService.HentBookingerForDatoAsync(klubb, bane, dato, bruker);
        return Ok(slots);
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> HentMineBookinger(string slug)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User);

        var mineBookinger = await bookingService.HentMineBookingerAsync(klubb, false, bruker);
        return Ok(mineBookinger);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i klubben.");

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User);

        var resultat = await bookingService.ForsøkOpprettBookingAsync(klubb, bane, dto, bruker);

        return resultat.Status == "Feil"
            ? BadRequest(resultat)
            : Ok(resultat);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> AvbestillBooking(string slug, [FromBody] NyBookingDto dto)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);

        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        var bane = klubb.Baner.FirstOrDefault(b => b.Id == dto.BaneId);
        if (bane == null)
            return NotFound("Bane ikke funnet i klubben.");

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User);

        var resultat = await bookingService.ForsøkAvbestillBookingAsync(klubb, bane, dto, bruker);

        return resultat.Status == "Feil"
            ? BadRequest(resultat)
            : Ok(resultat);
    }
}
