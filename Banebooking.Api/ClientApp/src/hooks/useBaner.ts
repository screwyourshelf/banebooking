import { useEffect, useState, useContext } from 'react';
import type { Bane } from '../types';
import { SlugContext } from '../layouts/Layout';

export function useBaner() {
    const [baner, setBaner] = useState<Bane[]>([]);
    const [loading, setLoading] = useState(true);
    const slug = useContext(SlugContext);


    useEffect(() => {
        fetch(`/api/klubb/${slug}/baner?`)
            .then((res) => res.json())
            .then(setBaner)
            .catch(() => setBaner([]))
            .finally(() => setLoading(false));
    }, []);

    return { baner, loading };
}