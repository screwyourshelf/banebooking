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
        public DbSet<RolleITilgang> Roller { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // BookingRegel (1:1 til Klubb)
            modelBuilder.Entity<BestemmelseForBooking>()
                .HasKey(b => b.KlubbId);

            modelBuilder.Entity<BestemmelseForBooking>()
                .HasOne(b => b.Klubb)
                .WithOne(k => k.BookingRegel)
                .HasForeignKey<BestemmelseForBooking>(b => b.KlubbId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            // Unik bane-navn per klubb
            modelBuilder.Entity<Bane>()
                .HasIndex(b => new { b.KlubbId, b.Navn })
                .IsUnique();

            modelBuilder.Entity<Bane>()
                .HasOne(b => b.Klubb)
                .WithMany(k => k.Baner)
                .HasForeignKey(b => b.KlubbId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Bane)
                .WithMany(bn => bn.Bookinger)
                .HasForeignKey(b => b.BaneId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Bruker)
                .WithMany(u => u.Bookinger)
                .HasForeignKey(b => b.BrukerId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            // RolleITilgang
            modelBuilder.Entity<RolleITilgang>()
                .HasIndex(r => new { r.KlubbId, r.Epost })
                .IsUnique();

            modelBuilder.Entity<RolleITilgang>()
                .HasOne(r => r.Klubb)
                .WithMany(k => k.Roller)
                .HasForeignKey(r => r.KlubbId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            modelBuilder.Entity<Booking>()
                .HasIndex(b => new { b.BaneId, b.Dato, b.StartTid })
                .IsUnique()
                .HasFilter("\"Aktiv\" = TRUE"); // viktig: bruk PostgreSQL-syntaks

        }
    }
}
