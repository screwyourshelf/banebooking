using Microsoft.AspNetCore.Mvc;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BanerController : ControllerBase
{
    [HttpGet]
    public IActionResult HentBaner()
    {
        var mock = new List<object>
        {
            new { id = Guid.NewGuid(), navn = "Bane A" },
            new { id = Guid.NewGuid(), navn = "Bane B" },
            new { id = Guid.NewGuid(), navn = "Bane C" }
        };

        return Ok(mock);
    }
}
