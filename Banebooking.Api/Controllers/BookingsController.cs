using Microsoft.AspNetCore.Mvc;
using Banebooking.Api.Dtos;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingerController : ControllerBase
{
    [HttpGet]
    public IActionResult HentBookinger([FromQuery] Guid baneId, [FromQuery] DateOnly dato)
    {
        // Mocket liste for 07:00–22:00
        var mock = new List<BookingSlotDto>();

        var brukere = new[]
        {
            (string?)null,
            null,
            "ola@eksempel.no",
            "kari@eksempel.no"
        };

        for (int time = 7; time < 22; time++)
        {
            mock.Add(new BookingSlotDto
            {
                StartTid = $"{time:00}:00",
                SluttTid = $"{time + 1:00}:00",
                BooketAv = brukere[Random.Shared.Next(brukere.Length)]
            });
        }

        return Ok(mock);
    }
}
