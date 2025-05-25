using Microsoft.AspNetCore.Mvc;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/baner")]
public class BanerController(IBaneService _baneService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> HentBaner(string slug)
    {
        var baner = await _baneService.HentBanerForKlubbAsync(slug);
        if (baner == null)
            return NotFound("Klubb ikke funnet");

        return Ok(baner);
    }
}
