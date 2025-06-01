// src/api/bruker.ts
import type { BrukerDto } from '../types/index.js';
import { supabase } from '../supabase.js';

export async function hentInnloggetBruker(slug: string): Promise<BrukerDto | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/bruker`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!res.ok) {
        const feilmelding = await res.text();
        throw new Error(feilmelding || 'Kunne ikke hente bruker');
    }

    const data = await res.json();
    return data ?? null;
}
