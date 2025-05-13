using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Banebooking.Api.Data;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BanerController(BanebookingDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> HentBaner()
    {
        var baner = await db.Baner
            .Where(b => b.Aktiv)
            .OrderBy(b => b.Navn)
            .Select(b => new
            {
                id = b.Id,
                navn = b.Navn
            })
            .ToListAsync();

        return Ok(baner);
    }
}
