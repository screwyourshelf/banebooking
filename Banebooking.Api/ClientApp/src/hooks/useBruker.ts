import { useState, useEffect } from 'react';
import { hentInnloggetBruker } from '../api/bruker';
import type { Bruker } from '../types';

export function useBruker(slug: string | undefined, inkluderHistoriske = false) {
    const [bruker, setBruker] = useState<Bruker | null>(null);
    const [laster, setLaster] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hent = async () => {
        if (!slug) return;
        try {
            setLaster(true);
            const res = await hentInnloggetBruker(slug, inkluderHistoriske);
            setBruker(res);
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
            else setError('Ukjent feil');
        } finally {
            setLaster(false);
        }
    };

    useEffect(() => {
        hent();
    }, [slug, inkluderHistoriske]);

    return {
        bruker,
        laster,
        error,
        refetch: hent
    };
}
