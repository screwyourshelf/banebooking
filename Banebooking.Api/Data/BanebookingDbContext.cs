using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Banebooking.Api.Data
{
    public class BanebookingDbContext : DbContext
    {
        public BanebookingDbContext(DbContextOptions<BanebookingDbContext> options)
            : base(options)
        {
        }

        public DbSet<Klubb> Klubber { get; set; }
        public DbSet<Bane> Baner { get; set; }
        public DbSet<Bruker> Brukere { get; set; }
        public DbSet<Booking> Bookinger { get; set; }
        public DbSet<BestemmelseForBooking> BookingRegler { get; set; }
        public DbSet<RapportertFravær> FraværsRapporter { get; set; }
        public DbSet<RolleITilgang> Roller { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BestemmelseForBooking>()
                .HasKey(b => b.KlubbId);

            modelBuilder.Entity<BestemmelseForBooking>()
                 .HasOne(b => b.Klubb)
                 .WithOne(k => k.BookingRegel)
                 .HasForeignKey<BestemmelseForBooking>(b => b.KlubbId)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolleITilgang>()
                .HasIndex(r => new { r.KlubbId, r.Epost })
                .IsUnique();

            modelBuilder.Entity<Booking>()
                .HasIndex(b => new { b.BaneId, b.Dato, b.StartTid })
                .IsUnique();

            modelBuilder.Entity<RapportertFravær>()
                .HasOne(r => r.Booking)
                .WithMany(b => b.FraværsRapporter)
                .HasForeignKey(r => r.BookingId);

            modelBuilder.Entity<RapportertFravær>()
                .HasOne(r => r.RapportertAv)
                .WithMany(b => b.RapporterteFravær)
                .HasForeignKey(r => r.RapportertAvBrukerId);

        }
    }
}
