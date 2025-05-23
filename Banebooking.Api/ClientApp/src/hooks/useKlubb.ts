import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { KlubbDetaljer } from '../types';
import { hentKlubb } from '../api/klubb';

export function useKlubb(slug?: string) {
    const [klubb, setKlubb] = useState<KlubbDetaljer | null>(null);
    const [laster, setLaster] = useState(true);

    useEffect(() => {
        if (!slug) return;

        setLaster(true);
        hentKlubb(slug)
            .then(setKlubb)
            .catch((err) => {
                toast.error(err.message);
                setKlubb(null);
            })
            .finally(() => setLaster(false));
    }, [slug]);

    return { klubb, laster };
}
