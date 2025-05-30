import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { forhandsvisMassebooking, opprettMassebooking } from '../api/massebooking.js';
import { useKlubb } from './useKlubb.js';
import { useBaner } from './useBaner.js';
import type { BookingDto, MassebookingDto } from '../types/index.js';

function parseTimeToMinutes(tid: string) {
    const [h, m] = tid.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(mins: number): string {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
}

function genererTidspunkter(start: string, slutt: string, slotMinutter: number): string[] {
    const startMin = parseTimeToMinutes(start);
    const sluttMin = parseTimeToMinutes(slutt);
    const result: string[] = [];

    for (let t = startMin; t + slotMinutter <= sluttMin; t += slotMinutter) {
        result.push(minutesToTime(t));
    }

    return result;
}

export function useMassebooking(slug: string | undefined) {
    const { klubb, laster: loadingKlubb } = useKlubb(slug);
    const { baner, loading: loadingBaner } = useBaner(!!slug);

    const tilgjengeligeTidspunkter = useMemo(() => {
        if (!klubb?.bookingRegel) return [];

        const start = klubb.bookingRegel.aapningstid || '08:00';
        const slutt = klubb.bookingRegel.stengetid || '22:00';
        const slot = klubb.bookingRegel.slotLengdeMinutter || 60;

        return genererTidspunkter(start, slutt, slot);
    }, [klubb]);

    const [loading, setLoading] = useState(false);
    const [forhandsvisning, setForhandsvisning] = useState<{
        ledige: BookingDto[];
        konflikter: BookingDto[];
    }>({ ledige: [], konflikter: [] });

    const forhandsvis = async (dto: MassebookingDto) => {
        if (!slug) return;
        setLoading(true);
        try {
            const data = await forhandsvisMassebooking(slug, dto);
            setForhandsvisning(data);
        } catch {
            toast.error('Feil ved forhåndsvisning');
        } finally {
            setLoading(false);
        }
    };

    const opprett = async (dto: MassebookingDto) => {
        if (!slug) return;
        setLoading(true);
        try {
            const result = await opprettMassebooking(slug, dto);
            setForhandsvisning({ ledige: [], konflikter: [] });
            toast.success(`${result.vellykkede.length} bookinger opprettet`);
            if (result.errors.length > 0) {
                toast.warn(`${result.errors.length} konflikter oppsto`);
            }
            return result;
        } catch {
            toast.error('Feil ved oppretting');
        } finally {
            setLoading(false);
        }
    };

    return {
        klubb,
        baner,
        loading: loading || loadingKlubb || loadingBaner,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        setForhandsvisning,
        forhandsvis,
        opprett,
    };
}
