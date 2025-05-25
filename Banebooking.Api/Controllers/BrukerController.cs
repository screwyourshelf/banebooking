using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Dtos.Bruker;
using Banebooking.Api.Tjenester;

[Authorize]
[ApiController]
[Route("api/klubb/{slug}/brukere")]
public class BrukerController(IBookingService bookingService, IBrukerService brukerService) : ControllerBase
{
    [HttpGet("meg")]
    public async Task<ActionResult<BrukerDto>> HentInnloggetBruker(string slug)
    {
        var bruker = User.Identity?.IsAuthenticated == true
            ? await brukerService.HentEllerOpprettBrukerAsync(User)
            : null;
        
        if (bruker == null)
            return Unauthorized("Bruker ikke autentisert eller token ugyldig.");

        var mineBookinger = await bookingService.HentBookingerAsync(slug, false, bruker);

        return Ok(new BrukerDto
        {
            Id = bruker.Id,
            Epost = bruker.Epost,
            Bookinger = mineBookinger
        });
    }
}
