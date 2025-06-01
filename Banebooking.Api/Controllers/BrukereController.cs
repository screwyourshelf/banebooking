using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/bruker")]
public class BrukerController(IBrukerService brukerService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> HentBruker(string slug)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Ok(null); // Ikke pålogget

        var bruker = await brukerService.HentEllerOpprettBrukerMedRolleAsync(slug, User);
        if (bruker == null)
            return Ok(null); // Token OK, men ikke match i systemet

        return Ok(new BrukerDto
        {
            Id = bruker.Id,
            Epost = bruker.Epost,
            Roller = bruker.Roller
                .Where(r => r.Klubb.Slug == slug)
                .Select(r => r.Rolle.ToString())
                .Distinct()
                .ToList()
        });
    }
}
