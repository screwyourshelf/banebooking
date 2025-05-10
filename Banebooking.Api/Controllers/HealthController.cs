using Banebooking.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly BanebookingDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(BanebookingDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
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
            _logger.LogError(ex, "Feil under DB-sjekk");
            return StatusCode(500, new
            {
                Error = "Exception occurred during database health check",
                Exception = ex.Message,
                Inner = ex.InnerException?.Message
            });
        }
    }
}
