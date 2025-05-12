using Banebooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Dto;
using Banebooking.Api.Controllers;

[ApiController]
[Route("api/bruker")]
public class BrukerController : ControllerBase
{
    private readonly BrukerHjelper _brukerHjelper;

    public BrukerController(BanebookingDbContext db)
    {
        _brukerHjelper = new BrukerHjelper(db);
    }

    [HttpGet("meg")]
    public async Task<ActionResult<BrukerDto>> HentInnloggetBruker()
    {
        try
        {
            var bruker = await _brukerHjelper.HentEllerOpprettBrukerAsync(User);

            return Ok(new BrukerDto
            {
                Id = bruker.Id,
                Epost = bruker.Epost,
                Bookinger = [.. bruker.Bookinger.Select(b => new BookingDto
                {
                    Id = b.Id,
                    StartTid = b.StartTid,
                    SluttTid = b.SluttTid,
                    BaneNavn = b.Bane?.Navn ?? "(ukjent bane)"
                })]
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}
