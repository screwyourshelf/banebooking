import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { hentMineBookinger, avbestillBooking } from '../api/booking';
import type { BookingSlot } from '../types';

export function useMineBookinger(slug: string | undefined) {
    const [bookinger, setBookinger] = useState<BookingSlot[]>([]);
    const [laster, setLaster] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hent = async () => {
        if (!slug) return;

        try {
            setLaster(true);
            const data = await hentMineBookinger(slug);
            setBookinger(data);
        } catch (e) {
            setError('Kunne ikke hente dine bookinger');
            toast.error(error);
        } finally {
            setLaster(false);
        }
    };

    useEffect(() => {
        hent();
    }, [slug]);

    const onCancel = async (slot: BookingSlot) => {
        if (!slug) return;

        // Fjern lokalt før API-kall
        setBookinger((prev) =>
            prev.filter((b) =>
                !(
                    b.dato === slot.dato &&
                    b.baneId === slot.baneId &&
                    b.startTid === slot.startTid &&
                    b.sluttTid === slot.sluttTid
                )
            )
        );

        try {
            await avbestillBooking(slug, slot.baneId, slot.dato, slot.startTid, slot.sluttTid);

            const tid = `${slot.startTid.slice(0, 2)}:${slot.startTid.slice(2, 4)}–${slot.sluttTid.slice(0, 2)}:${slot.sluttTid.slice(2, 4)}`;
            toast.info(`Avbestilling: ${slot.baneNavn ?? 'valgt bane'}, ${slot.dato} kl. ${tid} er avbestilt.`);
        } catch (e) {
            toast.error('Avbestilling feilet');
            // Hvis det feiler, legg sloten tilbake igjen
            setBookinger((prev) => [...prev, slot]);
        }
    };



    return {
        bookinger,
        laster,
        error,
        onCancel,
        refetch: hent,
    };
}
