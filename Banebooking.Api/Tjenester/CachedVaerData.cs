using Banebooking.Api.Dtos.Vær;

namespace Banebooking.Api.Tjenester
{
    public class CachedVaerData
    {
        public Dictionary<TimeOnly, Vaerinfo> Data { get; set; } = new();
        public DateTimeOffset SisteOppdatert { get; set; }
    }
}