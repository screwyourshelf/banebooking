using Banebooking.Api.Dtos.Bane;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/baner")]
public class BanerController(IBaneService baneService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> HentBaner(string slug, [FromQuery] bool inkluderInaktive = false)
    {
        var baner = await baneService.HentBanerForKlubbAsync(slug, inkluderInaktive);
        return Ok(baner);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> OpprettBane(string slug, [FromBody] NyBaneDto dto)
    {
        var opprettet = await baneService.OpprettBaneAsync(slug, dto);
        if (!opprettet)
            return NotFound("Klubb ikke funnet");

        return CreatedAtAction(nameof(HentBaner), new { slug }, null);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> OppdaterBane(string slug, Guid id, [FromBody] OppdaterBaneDto dto)
    {
        var oppdatert = await baneService.OppdaterBaneAsync(slug, id, dto);
        return oppdatert ? NoContent() : NotFound("Bane ikke funnet");
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeaktiverBane(string slug, Guid id)
    {
        var deaktivert = await baneService.DeaktiverBaneAsync(slug, id);
        return deaktivert ? NoContent() : NotFound("Bane ikke funnet");
    }

    [HttpPut("{id}/aktiver")]
    [Authorize]
    public async Task<IActionResult> AktiverBane(string slug, Guid id)
    {
        var aktivert = await baneService.AktiverBaneAsync(slug, id);
        return aktivert ? NoContent() : NotFound();

    }
}
