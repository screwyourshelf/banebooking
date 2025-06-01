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
        public DbSet<BrukerRolle> Roller { get; set; }
        public DbSet<Arrangement> Arrangementer { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1:1 Klubb ↔ BookingRegel
            modelBuilder.Entity<BestemmelseForBooking>()
                .HasKey(b => b.KlubbId);

            modelBuilder.Entity<BestemmelseForBooking>()
                .HasOne(b => b.Klubb)
                .WithOne(k => k.BookingRegel)
                .HasForeignKey<BestemmelseForBooking>(b => b.KlubbId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            // Klubb → Baner (1:m) med unikt navn per klubb
            modelBuilder.Entity<Bane>()
                .HasIndex(b => new { b.KlubbId, b.Navn })
                .IsUnique()
                .HasDatabaseName("IX_Bane_Klubb_Navn");

            modelBuilder.Entity<Bane>()
                .HasOne(b => b.Klubb)
                .WithMany(k => k.Baner)
                .HasForeignKey(b => b.KlubbId)
                .OnDelete(DeleteBehavior.Restrict);

            // Bane → Booking (1:m)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Bane)
                .WithMany(bn => bn.Bookinger)
                .HasForeignKey(b => b.BaneId)
                .OnDelete(DeleteBehavior.Restrict);

            // Bruker → Booking (1:m)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Bruker)
                .WithMany(u => u.Bookinger)
                .HasForeignKey(b => b.BrukerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Booking: unike tidsluker per bane, hvis aktiv (PostgreSQL-filter)
            modelBuilder.Entity<Booking>()
                .HasIndex(b => new { b.BaneId, b.Dato, b.StartTid })
                .IsUnique()
                .HasFilter("\"Aktiv\" = TRUE")
                .HasDatabaseName("IX_Booking_UnikSlotPerBane");

            // BrukerRolle: unik rolle per (klubb, bruker)
            modelBuilder.Entity<BrukerRolle>()
                .HasIndex(r => new { r.KlubbId, r.BrukerId })
                .IsUnique()
                .HasDatabaseName("IX_Rolle_UnikPerBrukerOgKlubb");

            modelBuilder.Entity<BrukerRolle>()
                .HasOne(r => r.Klubb)
                .WithMany(k => k.Roller)
                .HasForeignKey(r => r.KlubbId)
                .OnDelete(DeleteBehavior.Restrict); // Supabase-trygg

            modelBuilder.Entity<BrukerRolle>()
                .HasOne(r => r.Bruker)
                .WithMany(b => b.Roller)
                .HasForeignKey(r => r.BrukerId)
                .OnDelete(DeleteBehavior.Cascade); // Kan evt. endres til Restrict

            modelBuilder.Entity<Arrangement>()
                .HasOne(a => a.Klubb)
                .WithMany()
                .HasForeignKey(a => a.KlubbId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Arrangement>()
                .HasOne(a => a.OpprettetAv)
                .WithMany()
                .HasForeignKey(a => a.OpprettetAvId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Arrangement)
                .WithMany(a => a.Bookinger)
                .HasForeignKey(b => b.ArrangementId)
                .OnDelete(DeleteBehavior.SetNull); 

        }
    }
}
