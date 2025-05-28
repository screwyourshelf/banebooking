import { useEffect, useState, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import BaneTabs from '../components/BaneTabs';
import DatoVelger from '../components/DatoVelger';
import { BookingSlotList } from '../components/Booking/BookingSlotList';
import { useBaner } from '../hooks/useBaner';
import { useBooking } from '../hooks/useBooking';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { SlugContext } from '../layouts/Layout';

export default function IndexPage() {
    const { baner, loading } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<string>(() => {
        return localStorage.getItem('valgtDato') || new Date().toISOString().split('T')[0];
    });

    const currentUser = useCurrentUser();
    const slug = useContext(SlugContext);

    const {
        slots,
        apenSlotTid,
        setApenSlotTid,
        onBook,
        onCancel
    } = useBooking(slug, valgtDato, valgtBaneId);

    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner]);

    useEffect(() => {
        setApenSlotTid(null);
    }, [valgtDato, valgtBaneId]);

    useEffect(() => {
        if (!currentUser) {
            setApenSlotTid(null);
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('valgtDato', valgtDato);
    }, [valgtDato]);

    if (loading || !valgtBaneId) {
        return <div className="px-2 py-2">Laster baner...</div>;
    }

    return (
        <div className="w-100">
            <DatoVelger valgtDato={valgtDato} onVelgDato={setValgtDato} />
            <BaneTabs
                baner={baner}
                valgtBaneId={valgtBaneId}
                onVelgBane={setValgtBaneId}
            />
            <div className="w-100 py-1">
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
        </div>
    );
}
