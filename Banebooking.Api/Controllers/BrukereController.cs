using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos;
using Banebooking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bruker")]
public class BrukerController(BanebookingDbContext db, IBrukerService brukerService, IKlubbService klubbService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> HentBruker(string slug)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        if (!User.Identity?.IsAuthenticated ?? true)
            return Ok(null); // Ikke pålogget, men det er ok for dete endepunktet

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(klubb, User);
        if (bruker == null)
            return Ok(null); // Token OK, men ikke match i systemet

        return Ok(new BrukerDto
        {
            Id = bruker.Id,
            Epost = bruker.Epost,
            Roller = bruker.Roller
                .Where(r => r.KlubbId == klubb.Id)
                .Select(r => r.Rolle.ToString())
                .Distinct()
                .ToList()
        });
    }

    [Authorize]
    [HttpGet("sok")]
    public async Task<IActionResult> SøkBrukere(string slug, [FromQuery] string? query)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        if (!User.Identity?.IsAuthenticated ?? true)
            return Forbid();

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(klubb, User);
        if(bruker.Roller.All(r => r.KlubbId != klubb.Id || r.Rolle != RolleType.KlubbAdmin))
            return Forbid(); // Ikke admin i klubben

        List<BrukerDto> brukere = await brukerService.SokEtterBrukereAsync(klubb, query);

        return Ok(brukere);
    }



    [Authorize]
    [HttpPut("{brukerId}/rolle")]
    public async Task<IActionResult> OppdaterRolle(string slug, Guid brukerId, [FromBody] string rolle)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        if (!Enum.TryParse<RolleType>(rolle, out var nyRolle))
            return BadRequest("Ugyldig rolle.");

        var initiellBruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(klubb, User);
        if (initiellBruker.Roller.All(r => r.KlubbId != klubb.Id || r.Rolle != RolleType.KlubbAdmin))
            return Forbid();

        // Sjekk: ikke tillat at man endrer sin egen rolle
        if (initiellBruker.Id == brukerId)
            return Forbid("Du kan ikke endre din egen rolle.");

        var bruker = await db.Brukere
            .Include(b => b.Roller)
            .FirstOrDefaultAsync(b => b.Id == brukerId);

        if (bruker == null)
            return NotFound("Bruker ikke funnet");

        try
        {
            await brukerService.OppdaterRolleAsync(klubb, bruker, nyRolle);
            return Ok();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
