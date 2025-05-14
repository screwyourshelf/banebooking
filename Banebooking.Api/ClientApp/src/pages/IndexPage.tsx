import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import BaneTabs from '../components/BaneTabs';
import DatoVelger from '../components/DatoVelger';
import BookingSlotList from '../components/Booking/BookingSlotList';
import { useBaner } from '../hooks/useBaner';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';
import type { BookingSlot } from '../types';

export default function IndexPage() {
    const { baner, loading } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // auth
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const erAdmin = currentUser?.email === 'admin@eksempelklubb.no';

    // Velg første bane når tilgjengelig
    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner]);

    // Hent slots ved endringer
    const hentBookinger = () => {
        if (!valgtBaneId) return;
        fetch(`/api/bookinger?baneId=${valgtBaneId}&dato=${valgtDato}`)
            .then((res) => res.ok ? res.json() : [])
            .then((data) => setSlots(Array.isArray(data) ? data : []))
            .catch(() => setSlots([]));
    };

    useEffect(() => {
        hentBookinger();
    }, [valgtBaneId, valgtDato]);

    const onBook = async (slot: BookingSlot) => {
        if (!valgtBaneId) return;

        const nyBooking = {
            baneId: valgtBaneId,
            dato: valgtDato,
            startTid: slot.startTid,
            sluttTid: slot.sluttTid
        };

        const response = await fetch('/api/bookinger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nyBooking)
        });

        if (response.ok) {
            hentBookinger();
        } else {
            const error = await response.json();
            alert(error.melding || 'Kunne ikke booke slot.');
        }
    };

    if (loading || !valgtBaneId) {
        return <div className="px-2 py-2">Laster baner...</div>;
    }

    return (
        <div className="w-100">
            <BaneTabs
                baner={baner}
                valgtBaneId={valgtBaneId}
                onVelgBane={setValgtBaneId}
            />

            <DatoVelger valgtDato={valgtDato} onVelgDato={setValgtDato} />

            <div className="w-100 py-1">
                <BookingSlotList
                    slots={slots}
                    currentUser={currentUser}
                    isAdmin={!!erAdmin}
                    onBook={onBook}
                    onCancel={(slot) => console.log('Kanseller', slot)}
                    onDelete={(slot) => console.log('Slett', slot)}
                    onReportNoShow={(slot) => console.log('Ikke møtt', slot)}
                />
            </div>
        </div>
    );
}
