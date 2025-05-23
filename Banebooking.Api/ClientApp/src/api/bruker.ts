import { supabase } from '../supabase';
import type { Bruker } from '../types';

export async function hentInnloggetBruker(slug: string, inkluderHistoriske = false): Promise<Bruker> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error("Ingen tilgangstoken – du er ikke logget inn.");
    }

    const res = await fetch(`/api/klubb/${slug}/brukere/meg?inkluderHistoriske=${inkluderHistoriske}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return await res.json();
}
