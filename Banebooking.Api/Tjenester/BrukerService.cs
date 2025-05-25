using Banebooking.Api.Data;
using Banebooking.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Banebooking.Api.Tjenester;

public interface IBrukerService
{
    Task<Bruker> HentEllerOpprettBrukerAsync(ClaimsPrincipal principal);
}

public class BrukerService(BanebookingDbContext db) : IBrukerService
{
    public async Task<Bruker> HentEllerOpprettBrukerAsync(ClaimsPrincipal principal)
    {
        string? sub = HentSub(principal);
        string? email = HentEpost(principal);

        if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
            return null;

        if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
            throw new UnauthorizedAccessException("Mangler sub eller email i token");

        // Prøv å finne bruker via sub
        var user = await db.Brukere.FirstOrDefaultAsync(u => u.Sub == sub);
        if (user != null)
            return user;

        // Fallback: Finn via e-post (samme person med ny provider)
        user = await db.Brukere.FirstOrDefaultAsync(u => u.Epost == email);
        if (user != null)
        {
            user.Sub = sub;
            user.Provider = HentProvider(principal);
            await db.SaveChangesAsync();
            return user;
        }

        // Opprett ny bruker
        user = new Bruker
        {
            Sub = sub,
            Epost = email,
            Navn = HentNavn(principal),
            Provider = HentProvider(principal),
            OpprettetTid = DateTime.UtcNow,
        };

        db.Brukere.Add(user);
        await db.SaveChangesAsync();
        return user;
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

