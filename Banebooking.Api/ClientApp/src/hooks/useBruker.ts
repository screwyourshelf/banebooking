import { useEffect, useState } from 'react';
import { hentInnloggetBruker } from '../api/bruker';
import type { Bruker } from '../types';

export function useBruker(slug: string | undefined) {
    const [bruker, setBruker] = useState<Bruker | null>(null);
    const [laster, setLaster] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        hentInnloggetBruker(slug)
            .then(setBruker)
            .catch(err => setError(err.message))
            .finally(() => setLaster(false));
    }, [slug]);

    return { bruker, laster, error };
}
