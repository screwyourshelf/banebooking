import { supabase } from '../supabase.js'
import type { Bane, NyBane, OppdaterBane } from '../types/index.js';

export async function hentBaner(slug: string, inkluderInaktive = false): Promise<Bane[]> {
    const query = inkluderInaktive ? '?inkluderInaktive=true' : '';
    const res = await fetch(`/api/klubb/${slug}/baner${query}`);

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke hente baner');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}


export async function oppdaterBane(slug: string, id: string, dto: OppdaterBane): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/baner/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(dto),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke oppdatere bane');
    }
}

export async function opprettBane(slug: string, dto: NyBane): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/baner`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(dto),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke opprette bane');
    }
}

export async function deaktiverBane(slug: string, id: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/baner/${id}`, {
        method: 'DELETE',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke deaktivere bane');
    }
}

export async function aktiverBane(slug: string, id: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`/api/klubb/${slug}/baner/${id}/aktiver`, {
        method: 'PUT',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Kunne ikke aktivere bane');
    }
}

