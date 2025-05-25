using Microsoft.Extensions.Caching.Memory;

namespace Banebooking.Api.Tjenester;

public interface ICacheService
{
    T? Get<T>(string prefix, string slug, bool? inaktive = null);
    void Set<T>(string prefix, string slug, T data, bool? inaktive = null, TimeSpan? levetid = null);
    void Invalider(string prefix, string slug);
}

public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public CacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    private static string LagKey(string prefix, string slug, bool? inaktive = null)
    {
        var key = $"{prefix}:{slug.ToLowerInvariant()}";
        if (inaktive.HasValue)
            key += $":inkluderInaktive={inaktive.Value}";
        return key;
    }

    public T? Get<T>(string prefix, string slug, bool? inaktive = null)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return default;

        var key = LagKey(prefix, slug, inaktive);
        return _cache.TryGetValue(key, out var val) ? (T)val! : default;
    }

    public void Set<T>(string prefix, string slug, T data, bool? inaktive = null, TimeSpan? levetid = null)
    {
        var key = LagKey(prefix, slug, inaktive);
        _cache.Set(key, data, levetid ?? TimeSpan.FromHours(6));
    }

    public void Invalider(string prefix, string slug)
    {
        _cache.Remove(LagKey(prefix, slug, true));
        _cache.Remove(LagKey(prefix, slug, false));
    }
}
