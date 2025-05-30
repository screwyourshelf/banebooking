import { useEffect, useState, useContext } from 'react';
import type { Bane, NyBane, OppdaterBane } from '../types/index.js';
import { SlugContext } from '../layouts/Layout.js';
import {
    hentBaner,
    oppdaterBane as apiOppdaterBane,
    opprettBane as apiOpprettBane,
    deaktiverBane as apiDeaktiverBane,
    aktiverBane as apiAktiverBane
} from '../api/baner.js';

export function useBaner(inkluderInaktive = false) {
    const slug = useContext(SlugContext);
    const [baner, setBaner] = useState<Bane[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function lastBaner() {
        if (!slug) return;

        setLoading(true);
        setError(null);

        try {
            const data = await hentBaner(slug, inkluderInaktive);
            setBaner(data);
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
            setBaner([]);
        } finally {
            setLoading(false);
        }
    }

    async function oppdaterBane(id: string, endret: OppdaterBane) {
        if (!slug) return;

        await apiOppdaterBane(slug, id, endret);
        await lastBaner();
    }

    async function opprettBane(ny: NyBane) {
        if (!slug) return;

        await apiOpprettBane(slug, ny);
        await lastBaner();
    }

    async function deaktiverBane(id: string) {
        if (!slug) return;

        await apiDeaktiverBane(slug, id);
        await lastBaner();
    }

    async function aktiverBane(id: string) {
        if (!slug) return;

        await apiAktiverBane(slug, id);
        await lastBaner();
    }

    useEffect(() => {
        lastBaner();
    }, [slug]);

    return {
        baner,
        loading,
        error,
        oppdaterBane,
        opprettBane,
        deaktiverBane,
        aktiverBane,
        refetch: lastBaner,
    };
}
