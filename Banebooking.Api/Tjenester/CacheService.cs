using Microsoft.Extensions.Caching.Memory;

namespace Banebooking.Api.Tjenester;

public interface ICacheService
{
    T? Get<T>(string key);
    void Set<T>(string key, T data, TimeSpan? levetid = null);
    void Invalider(params string[] keys);
    IReadOnlyDictionary<string, DateTimeOffset> GetAllKeysWithTimestamps();
}

public static class CacheKeys
{
    public static string Baner(string slug, bool inkluderInaktive) =>
        $"baner:{slug.ToLowerInvariant()}:inkluderInaktive={inkluderInaktive}";

    public static string Klubb(string slug) =>
        $"klubb:{slug.ToLowerInvariant()}:full";

    // Cache-nøkkel for værdata for en klubb (inkluderer både kort- og langtidsvarsel)
    public static string VaerLangtids(Guid klubbId) =>
        $"vaer:langtids:{klubbId}";
}


public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly Dictionary<string, DateTimeOffset> _lastUpdated = new();

    public CacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public T? Get<T>(string key)
    {
        return _cache.TryGetValue(key, out var val) ? (T)val! : default;
    }

    public void Set<T>(string key, T data, TimeSpan? levetid = null)
    {
        _cache.Set(key, data, levetid ?? TimeSpan.FromHours(6));
        _lastUpdated[key] = DateTimeOffset.UtcNow;
    }

    public void Invalider(params string[] keys)
    {
        foreach (var key in keys)
        {
            _cache.Remove(key);
            _lastUpdated.Remove(key);
        }
    }

    public IReadOnlyDictionary<string, DateTimeOffset> GetAllKeysWithTimestamps()
    {
        return new Dictionary<string, DateTimeOffset>(_lastUpdated);
    }
}

