import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { hentMineBookinger } from '../api/booking.js';
import type { BookingSlot } from '../types/index.js';

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
        } catch {
            setError('Kunne ikke hente dine bookinger');
            toast.error(error);
        } finally {
            setLaster(false);
        }
    };

    useEffect(() => {
        hent();
    }, [slug]);


    return {
        bookinger,
        laster,
        error,
        refetch: hent,
    };
}
