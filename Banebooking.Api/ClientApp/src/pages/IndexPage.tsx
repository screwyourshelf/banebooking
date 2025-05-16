import { useEffect, useState, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import BaneTabs from '../components/BaneTabs';
import DatoVelger from '../components/DatoVelger';
import BookingSlotList from '../components/Booking/BookingSlotList';
import { useBaner } from '../hooks/useBaner';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';
import type { BookingSlot } from '../types';
import { SlugContext } from '../layouts/Layout';

export default function IndexPage() {
    const { baner, loading } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);

    const slug = useContext(SlugContext);

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

    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner]);

    useEffect(() => {
        setApenSlotTid(null); // nullstill ekspandert slot ved navigasjon
    }, [valgtDato, valgtBaneId]);

    const hentBookinger = () => {
        if (!valgtBaneId || !slug) return;
        fetch(`/api/klubb/${slug}/bookinger?baneId=${valgtBaneId}&dato=${valgtDato}`)
            .then((res) => res.ok ? res.json() : [])
            .then((data) => setSlots(Array.isArray(data) ? data : []))
            .catch(() => setSlots([]));
    };

    useEffect(() => {
        hentBookinger();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valgtBaneId, valgtDato, slug]);

    const onBook = async (slot: BookingSlot) => {
        if (!valgtBaneId || !slug) return;

        const nyBooking = {
            baneId: valgtBaneId,
            dato: valgtDato,
            startTid: slot.startTid,
            sluttTid: slot.sluttTid
        };

        const response = await fetch(`/api/klubb/${slug}/bookinger`, {
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
            <DatoVelger valgtDato={valgtDato} onVelgDato={setValgtDato} />
            <BaneTabs
                baner={baner}
                valgtBaneId={valgtBaneId}
                onVelgBane={setValgtBaneId}
            />
            <div className="w-100 py-1">
                <BookingSlotList
                    slots={slots}
                    currentUser={currentUser}
                    isAdmin={!!erAdmin}
                    apenSlotTid={apenSlotTid}
                    setApenSlotTid={setApenSlotTid}
                    onBook={onBook}
                    onCancel={(slot) => console.log('Kanseller', slot)}
                    onDelete={(slot) => console.log('Slett', slot)}
                    onReportNoShow={(slot) => console.log('Ikke møtt', slot)}
                />
            </div>
        </div>
    );
}
