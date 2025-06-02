using Banebooking.Api.Data;
using Banebooking.Api.Dtos;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Banebooking.Api.Tjenester;

public interface IBrukerService
{
    Task<Bruker> HentEllerOpprettBrukerMedRolleAsync(Klubb klubb, ClaimsPrincipal principal);
    Task<Guid?> HentUserIdAsync(ClaimsPrincipal principal);
    Task<List<BrukerDto>> SokEtterBrukereAsync(Klubb klubb, string? query);
    Task OppdaterRolleAsync(Klubb klubb, Bruker bruker, RolleType nyRolle);
}

public class BrukerService(BanebookingDbContext db) : IBrukerService
{
    public async Task<Bruker> HentEllerOpprettBrukerMedRolleAsync(Klubb klubb, ClaimsPrincipal principal)
    {
        string? sub = HentSub(principal);
        string? email = HentEpost(principal);

        if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
            throw new UnauthorizedAccessException("Mangler sub eller email i token");

        Bruker? bruker = await db.Brukere
            .Include(b => b.Roller)
            .FirstOrDefaultAsync(b => b.Sub == sub);

        // Fallback: samme e-post, men ny provider
        if (bruker == null)
        {
            bruker = await db.Brukere
                .Include(b => b.Roller)
                .FirstOrDefaultAsync(b => b.Epost == email);

            if (bruker != null)
            {
                bruker.Sub = sub;
                bruker.Provider = HentProvider(principal);
                await db.SaveChangesAsync();
            }
        }

        // Opprett ny bruker hvis fortsatt ikke funnet
        if (bruker == null)
        {
            bruker = new Bruker
            {
                Sub = sub,
                Epost = email,
                Navn = HentNavn(principal),
                Provider = HentProvider(principal),
                OpprettetTid = DateTime.UtcNow,
                Roller = new List<BrukerRolle>()
            };

            db.Brukere.Add(bruker);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Hvis vi traff unik constraint: hent igjen
                bruker = await db.Brukere
                    .Include(b => b.Roller)
                    .FirstOrDefaultAsync(b => b.Sub == sub);

                if (bruker == null)
                    throw new Exception("Klarte ikke å hente bruker etter insert conflict");
            }
        }

        // Sjekk eller legg til rolle
        if (klubb != null)
        {
            var eksisterendeRolle = bruker.Roller
                .FirstOrDefault(r => r.KlubbId == klubb.Id);

            if (eksisterendeRolle == null)
            {
                var nyRolle = new BrukerRolle
                {
                    Id = Guid.NewGuid(),
                    BrukerId = bruker.Id,
                    KlubbId = klubb.Id,
                    Rolle = RolleType.Medlem
                };

                db.Roller.Add(nyRolle);
                await db.SaveChangesAsync();

                bruker.Roller.Add(nyRolle);
            }
        }

        return bruker;
    }

    public async Task<Guid?> HentUserIdAsync(ClaimsPrincipal principal)
    {
        var sub = HentSub(principal);
        if (string.IsNullOrWhiteSpace(sub))
            return null;

        return await db.Brukere
            .Where(u => u.Sub == sub)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<List<BrukerDto>> SokEtterBrukereAsync(Klubb klubb, string? query)
    {
        var trimmedQuery = query?.Trim();

        return await db.Brukere
            .Include(b => b.Roller)
            .Where(b => string.IsNullOrEmpty(trimmedQuery) || b.Epost.Contains(trimmedQuery))
            .Select(b => new BrukerDto
            {
                Id = b.Id,
                Epost = b.Epost,
                Roller = b.Roller
                    .Where(r => r.KlubbId == klubb.Id)
                    .Select(r => r.Rolle.ToString())
                    .ToList()
            })
            .ToListAsync();
    }

    public async Task OppdaterRolleAsync(Klubb klubb, Bruker bruker, RolleType nyRolle)
    {
        var eksisterendeRolle = bruker.Roller.FirstOrDefault(r => r.KlubbId == klubb.Id);

        if (eksisterendeRolle != null)
        {
            eksisterendeRolle.Rolle = nyRolle;
        }
        else
        {
            db.Roller.Add(new BrukerRolle
            {
                Id = Guid.NewGuid(),
                BrukerId = bruker.Id,
                KlubbId = klubb.Id,
                Rolle = nyRolle
            });
        }

        await db.SaveChangesAsync();
    }


    private static string? HentSub(ClaimsPrincipal principal)
    {
        return principal.FindFirst("sub")?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    private static string? HentEpost(ClaimsPrincipal principal)
    {
        return principal.FindFirst("email")?.Value
            ?? principal.FindFirst(ClaimTypes.Email)?.Value;
    }

    private static string HentProvider(ClaimsPrincipal principal)
    {
        return principal.FindFirst("provider")?.Value
            ?? principal.FindFirst("https://supabase.io/auth/provider")?.Value
            ?? "unknown";
    }

    private static string? HentNavn(ClaimsPrincipal principal)
    {
        return principal.FindFirst("name")?.Value
            ?? principal.FindFirst("full_name")?.Value
            ?? principal.Identity?.Name;
    }

  
}
