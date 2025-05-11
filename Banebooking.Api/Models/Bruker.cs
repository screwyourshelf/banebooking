namespace Banebooking.Api.Models;

public class Bruker
{
    public Guid Id { get; set; }
    public string Epost { get; set; }
    public string LoginProvider { get; set; }

    public virtual ICollection<Booking> Bookinger { get; set; }
    public virtual ICollection<RapportertFravær> RapporterteFravær { get; set; }
}