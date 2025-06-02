using Banebooking.Api.Dtos.Booking;
using Banebooking.Api.Tjenester;

public class SlotBerikerMedVaer(IVaerService vaerService)
{
    public async Task BerikAsync(List<BookingSlotDto> slots, Klubb klubb, DateOnly dato)
    {
        // Hent all værdata for de neste 10 dagene
        var allVaerdata = await vaerService.HentVaerdataAsync(klubb);

        // Flat ut: Dato + Tidspunkt + Værinfo
        var flatVaerdata = allVaerdata
            .SelectMany(kvp => kvp.Value, (datoKvp, tidKvp) => new
            {
                Dato = datoKvp.Key,
                Tid = tidKvp.Key,
                Vaer = tidKvp.Value
            })
            .ToList();

        foreach (var slot in slots)
        {
            if (!TimeOnly.TryParse(slot.StartTid, out var slotTid))
                continue;

            var slotDateTime = dato.ToDateTime(slotTid);

            // Finn nærmeste tidspunkt i værdataene
            var nærmeste = flatVaerdata
                .OrderBy(v => Math.Abs((v.Dato.ToDateTime(v.Tid) - slotDateTime).TotalMinutes))
                .FirstOrDefault();

            if (nærmeste != null)
            {
                slot.VærSymbol = nærmeste.Vaer.SymbolCode;
                slot.Temperatur = nærmeste.Vaer.Temperature;
                slot.Vind = nærmeste.Vaer.WindSpeed;
            }
        }
    }
}
