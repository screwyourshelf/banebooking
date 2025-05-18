import { useEffect, useState, useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import BaneTabs from '../components/BaneTabs';
import DatoVelger from '../components/DatoVelger';
import BookingSlotList from '../components/Booking/BookingSlotList';
import { useBaner } from '../hooks/useBaner';
import { useBooking } from '../hooks/useBooking';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';
import { SlugContext } from '../layouts/Layout';

export default function IndexPage() {
    const { baner, loading } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<string>(() => {
        return localStorage.getItem('valgtDato') || new Date().toISOString().split('T')[0];
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const slug = useContext(SlugContext);

    const {
        slots,
        apenSlotTid,
        setApenSlotTid,
        onBook,
        onCancel
    } = useBooking(slug, valgtDato, valgtBaneId);

    // Hent brukerinfo (kan flyttes ut senere)
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

    // Sett første bane som default
    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner]);

    // Nullstill åpne slot når dato eller bane endres
    useEffect(() => {
        setApenSlotTid(null);
    }, [valgtDato, valgtBaneId]);

    // Lukk alle åpne slots når bruker logger ut
    useEffect(() => {
        if (!currentUser) {
            setApenSlotTid(null);
        }
    }, [currentUser]);

    // Lagre valgt dato i localStorage
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
                    currentUser={currentUser}
                    apenSlotTid={apenSlotTid}
                    setApenSlotTid={setApenSlotTid}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={(slot) => console.log('Slett', slot)}
                />
            </div>
        </div>
    );
}
