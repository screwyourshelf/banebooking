import { supabase } from '../supabase';
import type { MassebookingDto, BookingDto } from '../types';

export async function forhandsvisMassebooking(slug: string, dto: MassebookingDto) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/massebooking/forhandsvis`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Feil ved forhåndsvisning');
    }

    return await res.json() as {
        ledige: BookingDto[];
        konflikter: BookingDto[];
    };
}

export async function opprettMassebooking(slug: string, dto: MassebookingDto) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/massebooking`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Feil ved oppretting av massebooking');
    }

    return await res.json() as {
        vellykkede: BookingDto[];
        errors: {
            dato: string;
            tid: string;
            baneId: string;
            feilmelding: string;
        }[];
    };
}
