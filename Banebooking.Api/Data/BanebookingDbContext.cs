using Microsoft.EntityFrameworkCore;

namespace Banebooking.Api.Data
{
    public class BanebookingDbContext : DbContext
    {
        public BanebookingDbContext(DbContextOptions<BanebookingDbContext> options)
            : base(options)
        {
        }

        // Eksempel på en tabell:
        public DbSet<Bane> Baner { get; set; }
    }

    // Midlertidig modell for testing:
    public class Bane
    {
        public int Id { get; set; }
        public string Navn { get; set; }
    }
}
