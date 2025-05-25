import type { OppdaterKlubb, KlubbDetaljer } from '../types';
import { supabase } from '../supabase';

export async function hentKlubb(slug: string): Promise<KlubbDetaljer> {
    const res = await fetch(`/api/klubb/${slug}`);

    if (!res.ok) {
        let feilmelding = 'Kunne ikke hente klubb';
        try {
            const error = await res.json();
            feilmelding = error?.melding || feilmelding;
        } catch {
            // fallback hvis ikke JSON
        }

        throw new Error(feilmelding);
    }

    return await res.json();
}

export async function oppdaterKlubb(slug: string, data: OppdaterKlubb) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Kunne ikke oppdatere klubb');
    }
}


