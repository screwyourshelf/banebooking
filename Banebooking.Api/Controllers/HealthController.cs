using Banebooking.Api.Data;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly BanebookingDbContext _context;

    public HealthController(BanebookingDbContext context)
    {
        _context = context;
    }

    [HttpGet("db")]
    public async Task<IActionResult> CheckDb()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            return canConnect
                ? Ok("Database connection is OK")
                : StatusCode(500, "Cannot connect to database");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error connecting to DB: {ex.Message}");
        }
    }
}
