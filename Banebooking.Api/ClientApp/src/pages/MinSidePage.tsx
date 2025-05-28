import { useState, useContext, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { BookingSlotList } from '../components/Booking/BookingSlotList';
import { useMineBookinger } from '../hooks/useMineBookinger';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { SlugContext } from '../layouts/Layout';

export default function MinSidePage() {
    const { slug: slugFraParams } = useParams<{ slug: string }>();
    const slug = useContext(SlugContext) ?? slugFraParams;

    const currentUser = useCurrentUser();
    const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);
    const { bookinger, laster, onCancel } = useMineBookinger(slug ?? '');

    // Grupper bookinger per dato, og sorter per tid
    const grupperteBookinger = useMemo(() => {
        const grupper: Record<string, typeof bookinger> = {};

        for (const slot of bookinger) {
            if (!grupper[slot.dato]) {
                grupper[slot.dato] = [];
            }
            grupper[slot.dato].push(slot);
        }

        for (const dato in grupper) {
            grupper[dato].sort((a, b) => a.startTid.localeCompare(b.startTid));
        }

        return Object.entries(grupper).sort(([datoA], [datoB]) => datoA.localeCompare(datoB));
    }, [bookinger]);

    if (laster) return <Spinner animation="border" />;

    return (
        <div className="container mt-3">
            <h5>Mine kommende bookinger</h5>
            {grupperteBookinger.length === 0 && (
                <div className="text-muted">Ingen aktive bookinger funnet.</div>
            )}

            {grupperteBookinger.map(([dato, slots]) => (
                <div key={dato} className="mb-3">
                    <h6 className="text-muted">{dato}</h6>
                    <BookingSlotList
                        slots={slots}
                        currentUser={currentUser ? { epost: currentUser.email ?? '' } : null}
                        modus="minside"
                        onCancel={onCancel}
                        apenSlotTid={apenSlotTid}
                        setApenSlotTid={setApenSlotTid}
                    />
                </div>
            ))}
        </div>
    );
}
