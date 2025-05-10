using Microsoft.AspNetCore.Mvc;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "Hello world! => fra backend ;)" });
    }
}
