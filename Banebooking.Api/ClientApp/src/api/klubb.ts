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
