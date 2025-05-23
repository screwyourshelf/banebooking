namespace Banebooking.Api.Tjenester
{
    public interface ITidProvider
    {
        DateTime Nå();
        DateOnly DatoIDag();
        TimeOnly KlokkeslettNå();
    }

    public class NorskTidProvider : ITidProvider
    {
        private static readonly TimeZoneInfo Oslo = TimeZoneInfo.FindSystemTimeZoneById("Europe/Oslo");

        public DateTime Nå() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Oslo);
        public DateOnly DatoIDag() => DateOnly.FromDateTime(Nå().Date);
        public TimeOnly KlokkeslettNå() => TimeOnly.FromDateTime(Nå());
    }

}
