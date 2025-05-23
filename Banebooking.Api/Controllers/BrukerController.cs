using Banebooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Dtos.Bruker;
using Banebooking.Api.Tjenester;

[Authorize]
[ApiController]
[Route("api/klubb/{slug}/brukere")]
public class BrukerController : ControllerBase
{
    private readonly IBrukerService _brukerService;
    private readonly IBookingService _bookingService;

    public BrukerController(BanebookingDbContext db, IBookingService bookingService, IBrukerService brukerService)
    {
        _brukerService = brukerService;
        _bookingService = bookingService;
    }

    [HttpGet("meg")]
    public async Task<ActionResult<BrukerDto>> HentInnloggetBruker(string slug)
    {
        var bruker = await _brukerService.HentEllerOpprettBrukerAsync(User);
        var mineBookinger = await _bookingService.HentBookingerAsync(slug, false, bruker);

        return Ok(new BrukerDto
        {
            Id = bruker.Id,
            Epost = bruker.Epost,
            Bookinger = mineBookinger
        });
    }
}
