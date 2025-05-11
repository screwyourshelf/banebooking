namespace Banebooking.Api.Models;

public class Bruker
{
    public Guid Id { get; set; }

    public string Epost { get; set; } = string.Empty;
    public string LoginProvider { get; set; } = string.Empty;

    public virtual ICollection<Booking> Bookinger { get; set; } = new List<Booking>();
    public virtual ICollection<RapportertFravær> RapporterteFravær { get; set; } = new List<RapportertFravær>();
}
