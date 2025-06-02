using Banebooking.Api.Dtos.Vær;
using System.Net;
using System.Text.Json;

namespace Banebooking.Api.Tjenester;

public interface IVaerService
{
    Task<Dictionary<DateOnly, Dictionary<TimeOnly, Vaerinfo>>> HentVaerdataAsync(Klubb klubb);
}

public class VaerService(
    ICacheService cache,
    IHttpClientFactory httpClientFactory) : IVaerService
{
    private const int KorttidsGrenseTimer = 48;

    public async Task<Dictionary<DateOnly, Dictionary<TimeOnly, Vaerinfo>>> HentVaerdataAsync(Klubb klubb)
    {
        if (klubb == null || klubb.Latitude == null || klubb.Longitude == null)
            return new();

        var key = CacheKeys.VaerLangtids(klubb.Id);
        var cached = cache.Get<CachedVaerLangtidsData>(key);

        if (cached == null || cached.BorOppdateres)
        {
            cached = await OppdaterOgCacheVaerData(klubb, key, cached?.SisteOppdatert);
        }

        return cached.Data;
    }

    private async Task<CachedVaerLangtidsData> OppdaterOgCacheVaerData(Klubb klubb, string cacheKey, DateTimeOffset? ifModifiedSince)
    {
        var client = httpClientFactory.CreateClient("VaerApi");
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={klubb.Latitude}&lon={klubb.Longitude}");

        if (ifModifiedSince.HasValue)
            request.Headers.IfModifiedSince = ifModifiedSince;

        var response = await client.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotModified &&
            cache.Get<CachedVaerLangtidsData>(cacheKey) is { } existingCached)
        {
            cache.Set(cacheKey, existingCached, TimeSpan.FromHours(1));
            return existingCached;
        }

        response.EnsureSuccessStatusCode();
        var lastModified = response.Content.Headers.LastModified ?? DateTimeOffset.UtcNow;

        using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);

        var result = new Dictionary<DateOnly, Dictionary<TimeOnly, Vaerinfo>>();
        var nå = DateTimeOffset.UtcNow;

        foreach (var timepoint in doc.RootElement.GetProperty("properties").GetProperty("timeseries").EnumerateArray())
        {
            var tidspunkt = DateTimeOffset.Parse(timepoint.GetProperty("time").GetString()!);
            var dato = DateOnly.FromDateTime(tidspunkt.DateTime);
            var tid = TimeOnly.FromDateTime(tidspunkt.DateTime);

            var data = timepoint.GetProperty("data");
            var instant = data.GetProperty("instant").GetProperty("details");

            string symbol = "";

            if (data.TryGetProperty("next_1_hours", out var neste1t) &&
                neste1t.TryGetProperty("summary", out var summary1) &&
                summary1.TryGetProperty("symbol_code", out var symbol1))
            {
                symbol = symbol1.GetString() ?? "";
            }
            else if (data.TryGetProperty("next_6_hours", out var neste6t) &&
                     neste6t.TryGetProperty("summary", out var summary6) &&
                     summary6.TryGetProperty("symbol_code", out var symbol6))
            {
                symbol = symbol6.GetString() ?? "";
            }
            else if (data.TryGetProperty("next_12_hours", out var neste12t) &&
                     neste12t.TryGetProperty("summary", out var summary12) &&
                     summary12.TryGetProperty("symbol_code", out var symbol12))
            {
                symbol = symbol12.GetString() ?? "";
            }

            if (!result.ContainsKey(dato))
                result[dato] = [];

            result[dato][tid] = new Vaerinfo
            {
                SymbolCode = symbol,
                Temperature = instant.GetProperty("air_temperature").GetDouble(),
                WindSpeed = instant.GetProperty("wind_speed").GetDouble()
            };
        }

        var levetid = result.Keys.Any(d =>
            (d.ToDateTime(TimeOnly.MinValue) - nå).TotalHours <= KorttidsGrenseTimer)
            ? TimeSpan.FromHours(1)
            : TimeSpan.FromHours(6);

        var nyCache = new CachedVaerLangtidsData
        {
            Data = result,
            SisteOppdatert = lastModified
        };

        cache.Set(cacheKey, nyCache, levetid);
        return nyCache;
    }
}
