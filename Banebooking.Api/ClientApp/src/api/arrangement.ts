import { supabase } from '../supabase.js';
import type { BookingDto, ArrangementDto, OpprettArrangementDto } from '../types/index.js';

export async function hentKommendeArrangementer(slug: string) {
    const res = await fetch(`/api/klubb/${slug}/arrangement/kommende`, {
        headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Feil ved henting av arrangementer');
    }

    return await res.json() as ArrangementDto[];
}

export async function forhandsvisArrangement(slug: string, dto: OpprettArrangementDto) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/arrangement/forhandsvis`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Feil ved forhåndsvisning av arrangement');
    }

    return await res.json() as {
        ledige: BookingDto[];
        konflikter: BookingDto[];
    };
}

export async function opprettArrangement(slug: string, dto: OpprettArrangementDto) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/arrangement`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Feil ved oppretting av arrangement');
    }

    return await res.json() as {
        opprettet: BookingDto[];
        konflikter: {
            dato: string;
            tid: string;
            baneId: string;
            feilmelding: string;
        }[];
    };
}

