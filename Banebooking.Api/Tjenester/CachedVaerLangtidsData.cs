using Banebooking.Api.Dtos.Vær;

namespace Banebooking.Api.Tjenester;

public class CachedVaerLangtidsData
{
    public Dictionary<DateOnly, Dictionary<TimeOnly, Vaerinfo>> Data { get; set; } = [];
    public DateTimeOffset SisteOppdatert { get; set; }

    public bool BorOppdateres => DateTimeOffset.UtcNow - SisteOppdatert > TimeSpan.FromHours(1);
}
