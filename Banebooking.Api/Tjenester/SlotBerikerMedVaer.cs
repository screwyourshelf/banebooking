using Banebooking.Api.Dtos.Booking;
using Banebooking.Api.Tjenester;

namespace Banebooking.Api.Tjenester;

public class SlotBerikerMedVaer
{
    private readonly IVaerService _vaerService;

    public SlotBerikerMedVaer(IVaerService vaerService)
    {
        _vaerService = vaerService;
    }

    public async Task BerikAsync(List<BookingSlotDto> slots, Guid klubbId, DateOnly dato)
    {
        var vaerdata = await _vaerService.HentVaerdataAsync(klubbId, dato);

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
