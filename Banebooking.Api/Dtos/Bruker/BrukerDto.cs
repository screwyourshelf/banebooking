using Banebooking.Api.Dtos.Booking;
using System;
using System.Collections.Generic;

namespace Banebooking.Api.Dtos.Bruker;

public class BrukerDto
{
    public Guid Id { get; set; }

    public string Epost { get; set; } = string.Empty;

    public List<BookingSlotDto> Bookinger { get; set; } = new();
}
