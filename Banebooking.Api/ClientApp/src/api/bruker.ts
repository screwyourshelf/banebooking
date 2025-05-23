import { supabase } from '../supabase';
import type { Bruker } from '../types';

export async function hentInnloggetBruker(slug: string): Promise<Bruker> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error("Ingen tilgangstoken – du er ikke logget inn.");
    }

    const res = await fetch(`/api/klubb/${slug}/brukere/meg`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return await res.json();
}
