using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Data;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/baner")]
public class BanerController(BanebookingDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> HentBaner(string slug)
    {
        var baner = await db.Baner
        .Where(b => b.Aktiv && b.Klubb.Slug == slug)
        .OrderBy(b => b.Navn)
        .Select(b => new
        {
            id = b.Id,
            navn = b.Navn,
            slug = b.Slug,
            beskrivelse = b.Beskrivelse
        })
        .ToListAsync();

        return Ok(baner);
    }
}
