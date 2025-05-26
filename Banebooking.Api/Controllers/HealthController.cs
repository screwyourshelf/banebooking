using Banebooking.Api.Data;
using Banebooking.Api.Tjenester;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class HealthController(
    BanebookingDbContext context,
    ILogger<HealthController> logger,
    ICacheService cache) : ControllerBase
{
    [HttpGet("db")]
    public async Task<IActionResult> CheckDb()
    {
        try
        {
            var canConnect = await context.Database.CanConnectAsync();
            return canConnect
                ? Ok("Database connection is OK")
                : StatusCode(500, "Cannot connect to database");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Feil under DB-sjekk");
            return StatusCode(500, new
            {
                Error = "Exception occurred during database health check",
                Exception = ex.Message,
                Inner = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("cache")]
    public IActionResult CheckCache()
    {
        try
        {
            // Dummy set + get-test
            const string testKey = "__health:ping";
            cache.Set(testKey, "pong", TimeSpan.FromSeconds(5));

            var value = cache.Get<string>(testKey);
            return value == "pong"
                ? Ok("Cache is working")
                : StatusCode(500, "Cache read/write failed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Feil under cache-sjekk");
            return StatusCode(500, new
            {
                Error = "Exception occurred during cache health check",
                Exception = ex.Message,
                Inner = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("cachekeys")]
    public IActionResult GetCacheKeys()
    {
        var keys = cache.GetAllKeysWithTimestamps()
            .OrderByDescending(k => k.Value)
            .Select(kvp => new
            {
                Key = kvp.Key,
                SistOppdatert = kvp.Value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss")
            });

        return Ok(keys);
    }

}
