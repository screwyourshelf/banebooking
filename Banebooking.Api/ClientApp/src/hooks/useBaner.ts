import { useEffect, useState } from 'react';
import type { Bane } from '../types';

export function useBaner() {
    const [baner, setBaner] = useState<Bane[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/baner')
            .then((res) => res.json())
            .then(setBaner)
            .catch(() => setBaner([]))
            .finally(() => setLoading(false));
    }, []);

    return { baner, loading };
}
