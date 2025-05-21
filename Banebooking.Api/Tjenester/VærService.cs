using Banebooking.Api.Data;
using Banebooking.Api.Dtos.Vær;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using System.Text.Json;

namespace Banebooking.Api.Tjenester;

public interface IVaerService
{
    Task<Dictionary<TimeOnly, Vaerinfo>> HentVaerdataAsync(Guid klubbId, DateOnly dato);
}

public class VaerService : IVaerService
{
    private readonly IMemoryCache _cache;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly BanebookingDbContext _db;
    private readonly ILogger<VaerService> _logger;

    public VaerService(IMemoryCache cache, IHttpClientFactory httpClientFactory, BanebookingDbContext db, ILogger<VaerService> logger)
    {
        _cache = cache;
        _httpClientFactory = httpClientFactory;
        _db = db;
        _logger = logger;
    }

    public async Task<Dictionary<TimeOnly, Vaerinfo>> HentVaerdataAsync(Guid klubbId, DateOnly dato)
    {
        var klubb = await _db.Klubber.FindAsync(klubbId);
        if (klubb == null || klubb.Latitude == null || klubb.Longitude == null)
            return new();

        var cacheKey = $"vaer:klubb:{klubbId}:{dato:yyyy-MM-dd}";
        _cache.TryGetValue(cacheKey, out CachedVaerData? cached);

        var client = _httpClientFactory.CreateClient("VaerApi");

        var url = $"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={klubb.Latitude}&lon={klubb.Longitude}";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        if (cached != null)
        {
            request.Headers.IfModifiedSince = cached.SisteOppdatert;
        }

        var response = await client.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotModified && cached != null)
        {
            _logger.LogDebug("Værdata ikke endret – bruker cache.");
            _cache.Set(cacheKey, cached, new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = response.Content.Headers.Expires ?? DateTimeOffset.UtcNow.AddHours(3)
            });

            return cached.Data;
        }

        response.EnsureSuccessStatusCode();
        var lastModified = response.Content.Headers.LastModified ?? DateTimeOffset.UtcNow;
        var expires = response.Content.Headers.Expires ?? DateTimeOffset.UtcNow.AddHours(3);

        using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);

        var result = new Dictionary<TimeOnly, Vaerinfo>();

        foreach (var timepoint in doc.RootElement.GetProperty("properties").GetProperty("timeseries").EnumerateArray())
        {
            var tidspunkt = DateTime.Parse(timepoint.GetProperty("time").GetString()!);
            if (DateOnly.FromDateTime(tidspunkt) != dato)
                continue;

            var data = timepoint.GetProperty("data");
            var instant = data.GetProperty("instant").GetProperty("details");

            string symbol = "";

            if (data.TryGetProperty("next_1_hours", out var neste1t)
                && neste1t.TryGetProperty("summary", out var summary)
                && summary.TryGetProperty("symbol_code", out var symbolProp))
            {
                symbol = symbolProp.GetString() ?? "";
            }

            result[TimeOnly.FromDateTime(tidspunkt)] = new Vaerinfo
            {
                SymbolCode = symbol,
                Temperature = instant.GetProperty("air_temperature").GetDouble(),
                WindSpeed = instant.GetProperty("wind_speed").GetDouble()
            };
        }

        var newCached = new CachedVaerData
        {
            Data = result,
            SisteOppdatert = lastModified
        };

        _cache.Set(cacheKey, newCached, new MemoryCacheEntryOptions
        {
            AbsoluteExpiration = expires
        });

        return result;
    }
}




