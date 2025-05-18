import { useEffect, useState, useContext } from 'react';
import type { Bane } from '../types';
import { SlugContext } from '../layouts/Layout';
import { hentBaner } from '../api/baner';

export function useBaner() {
    const [baner, setBaner] = useState<Bane[]>([]);
    const [loading, setLoading] = useState(true);
    const slug = useContext(SlugContext);


    useEffect(() => {
        if (!slug) return;

        hentBaner(slug)
            .then(setBaner)
            .catch(() => setBaner([]))
            .finally(() => setLoading(false));
    }, [slug]);

    return { baner, loading };
}