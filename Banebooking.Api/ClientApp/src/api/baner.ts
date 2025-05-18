import type { Bane } from '../types';

export async function hentBaner(slug: string): Promise<Bane[]> {
    const res = await fetch(`/api/klubb/${slug}/baner`);

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke hente baner');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
