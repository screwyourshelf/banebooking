import type { KlubbDetaljer } from '../types';

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

export async function hentBaner(slug: string): Promise<Bane[]> {
    const res = await fetch(`/api/klubb/${slug}/baner`);

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke hente baner');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
