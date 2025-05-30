import { useEffect, useState, useContext } from 'react';
import { format } from 'date-fns';
import BaneTabs from '../components/BaneTabs.js';
import DatoVelger from '../components/DatoVelger.js';
import { BookingSlotList } from '../components/Booking/BookingSlotList.js';
import { useBaner } from '../hooks/useBaner.js';
import { useBooking } from '../hooks/useBooking.js';
import { useCurrentUser } from '../hooks/useCurrentUser.js';
import { SlugContext } from '../layouts/Layout.js';

export default function IndexPage() {
    const { baner, loading } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<Date | null>(() => {
        const lagret = localStorage.getItem('valgtDato');
        return lagret ? new Date(lagret) : new Date();
    });

    const currentUser = useCurrentUser();
    const slug = useContext(SlugContext);

    const valgtDatoStr = valgtDato ? format(valgtDato, 'yyyy-MM-dd') : '';

    const { slots, apenSlotTid, setApenSlotTid, onBook, onCancel } = useBooking(
        slug,
        valgtDatoStr,
        valgtBaneId
    );

    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner, valgtBaneId]);

    useEffect(() => {
        setApenSlotTid(null);
    }, [valgtDato, valgtBaneId, setApenSlotTid]);

    useEffect(() => {
        if (!currentUser) {
            setApenSlotTid(null);
        }
    }, [currentUser, setApenSlotTid]);

    useEffect(() => {
        if (valgtDato) {
            localStorage.setItem('valgtDato', valgtDato.toISOString());
        }
    }, [valgtDato]);

    if (loading || !valgtBaneId) {
        return (
            <p className="text-sm text-muted-foreground px-2 py-2 text-center">
                Laster baner...
            </p>
        );
    }

    return (
        <div className="max-w-screen-sm mx-auto px-1 py-1">
            <div className="mb-2">
                <DatoVelger
                    value={valgtDato}
                    onChange={(date) => setValgtDato(date ?? null)}
                />
            </div>

            <div className="mb-0">
                <BaneTabs
                    baner={baner}
                    valgtBaneId={valgtBaneId}
                    onVelgBane={setValgtBaneId}
                />
            </div>

            <BookingSlotList
                slots={slots}
                currentUser={currentUser ? { epost: currentUser.email ?? '' } : null}
                apenSlotTid={apenSlotTid}
                setApenSlotTid={setApenSlotTid}
                onBook={onBook}
                onCancel={onCancel}
                onDelete={(slot) => console.log('Slett', slot)}
                modus="index"
            />

        </div>
    );
}
