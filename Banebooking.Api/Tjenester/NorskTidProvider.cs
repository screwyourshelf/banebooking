namespace Banebooking.Api.Tjenester
{
    public interface ITidProvider
    {
        DateTime Nå();
        DateOnly DatoIDag();
        TimeOnly KlokkeslettNå();

        TidspunktSnapshot NåSnapshot();
    }

    public class NorskTidProvider : ITidProvider
    {
        private static readonly TimeZoneInfo Oslo = TimeZoneInfo.FindSystemTimeZoneById("Europe/Oslo");

        public DateTime Nå() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Oslo);
        public DateOnly DatoIDag() => DateOnly.FromDateTime(Nå().Date);
        public TimeOnly KlokkeslettNå() => TimeOnly.FromDateTime(Nå());

        public TidspunktSnapshot NåSnapshot() => new(Nå());
    }

    public class TidspunktSnapshot
    {
        public DateTime Nå { get; }
        public DateOnly IDag { get; }
        public TimeOnly NåTid { get; }

        public TidspunktSnapshot(DateTime nå)
        {
            Nå = nå;
            IDag = DateOnly.FromDateTime(nå);
            NåTid = TimeOnly.FromDateTime(nå);
        }
    }
}
