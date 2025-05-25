using Banebooking.Api.Dtos.Booking;

namespace Banebooking.Api.Tjenester;

public class SlotBerikerMedVaer(IVaerService vaerService)
{
    public async Task BerikAsync(List<BookingSlotDto> slots, Guid klubbId, DateOnly dato)
    {
        var vaerdata = await vaerService.HentVaerdataAsync(klubbId, dato);

        foreach (var slot in slots)
        {
            if (TimeOnly.TryParse(slot.StartTid, out var start))
            {
                if (vaerdata.TryGetValue(start, out var vaer))
                {
                    slot.VærSymbol = vaer.SymbolCode;
                    slot.Temperatur = vaer.Temperature;
                    slot.Vind = vaer.WindSpeed;
                }
            }
        }
    }
}
