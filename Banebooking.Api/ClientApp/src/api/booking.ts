import { supabase } from '../supabase';
import type { BookingSlot } from '../types';

export async function hentBookinger(
    slug: string,
    baneId: string,
    dato: string
): Promise<BookingSlot[]> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(
        `/api/klubb/${slug}/bookinger?baneId=${baneId}&dato=${dato}`,
        {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
    );

    if (!res.ok) throw new Error('Kunne ikke hente bookinger');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function opprettBooking(
    slug: string,
    baneId: string,
    dato: string,
    startTid: string,
    sluttTid: string
): Promise<void> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/bookinger`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ baneId, dato, startTid, sluttTid }),
    });

    if (!res.ok) {
        let msg = 'Kunne ikke booke';
        try {
            const error = await res.json();
            msg = error?.melding || msg;
        } catch {
            // fallback: ikke JSON
        }

        throw new Error(msg);
    }
}

export async function avbestillBooking(
    slug: string,
    baneId: string,
    dato: string,
    startTid: string,
    sluttTid: string
): Promise<void> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/bookinger`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ baneId, dato, startTid, sluttTid }),
    });

    if (!res.ok) {
        let msg = 'Kunne ikke avbestille';
        try {
            const error = await res.json();
            msg = error?.melding || msg;
        } catch {
            // fallback hvis ikke JSON
        }

        throw new Error(msg);
    }
}

export async function hentMineBookinger(
    slug: string
): Promise<BookingSlot[]> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/bookinger/mine`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) throw new Error('Kunne ikke hente dine bookinger');

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
