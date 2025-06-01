using Banebooking.Api.Data;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Banebooking.Api.Tjenester;

public interface IBrukerService
{
    Task<Bruker> HentEllerOpprettBrukerMedRolleAsync(string slug, ClaimsPrincipal principal);
    Task<Guid?> HentUserIdAsync(ClaimsPrincipal principal);
}

public class BrukerService(BanebookingDbContext db) : IBrukerService
{
    public async Task<Bruker> HentEllerOpprettBrukerMedRolleAsync(string slug, ClaimsPrincipal principal)
    {
        string? sub = HentSub(principal);
        string? email = HentEpost(principal);

        if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
            throw new UnauthorizedAccessException("Mangler sub eller email i token");

        // Prøv å finne bruker via sub
        var bruker = await db.Brukere.FirstOrDefaultAsync(u => u.Sub == sub);

        if (bruker == null)
        {
            // Fallback: Finn via e-post (samme person med ny provider)
            bruker = await db.Brukere.FirstOrDefaultAsync(u => u.Epost == email);
            if (bruker != null)
            {
                bruker.Sub = sub;
                bruker.Provider = HentProvider(principal);
                await db.SaveChangesAsync();
            }
        }

        // Hvis fortsatt ikke finnes – opprett
        if (bruker == null)
        {
            bruker = new Bruker
            {
                Sub = sub,
                Epost = email,
                Navn = HentNavn(principal),
                Provider = HentProvider(principal),
                OpprettetTid = DateTime.UtcNow,
            };
            db.Brukere.Add(bruker);
            await db.SaveChangesAsync();
        }

        // Hent klubb og legg til rolle hvis mangler
        var klubb = await db.Klubber
            .Include(k => k.Roller)
            .FirstOrDefaultAsync(k => k.Slug == slug);

        if (klubb != null)
        {
            var eksisterendeRolle = klubb.Roller
                .FirstOrDefault(r => r.BrukerId == bruker.Id);

            if (eksisterendeRolle == null)
            {
                var nyRolle = new BrukerRolle
                {
                    BrukerId = bruker.Id,
                    Rolle = RolleType.Medlem,
                    KlubbId = klubb.Id
                };

                klubb.Roller.Add(nyRolle);
                await db.SaveChangesAsync();

                bruker.Roller.Add(nyRolle);
            }
            else
            {
                bruker.Roller.Add(eksisterendeRolle);
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
