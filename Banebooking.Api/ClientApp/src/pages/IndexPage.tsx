import { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import BaneTabs from '../components/BaneTabs';
import DatoVelger from '../components/DatoVelger';
import { useBaner } from '../hooks/useBaner';
import type { BookingSlot } from '../types';

export default function IndexPage() {
    const { baner, loading } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    
    // Når baner er lastet, velg første
    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner]);

    // Hent slots når bane eller dato endres
    useEffect(() => {
        if (!valgtBaneId) return;

        fetch(`/api/bookinger?baneId=${valgtBaneId}&dato=${valgtDato}`)
            .then((res) => res.ok ? res.json() : [])
            .then((data) => setSlots(Array.isArray(data) ? data : []))
            .catch(() => setSlots([]));
    }, [valgtBaneId, valgtDato]);

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

            {/* Slotliste */}
            <div className="w-100 py-1">
                {slots.length > 0 ? (
                    <ListGroup className="w-100">
                        {slots.map((slot, index) => (
                            <ListGroup.Item key={index} className={`w-100 py-1 px-1 m-0 ${index % 2 === 0 ? 'bg-light' : 'bg-white'}`}>
                                <div className="d-flex flex-nowrap align-items-start">
                                    <div className="fw-semibold text-nowrap border-end pe-1">
                                        {slot.startTid.slice(0, 2)}-{slot.sluttTid.slice(0, 2)}
                                    </div>
                                    <div className="ps-2 text-break">{slot.booketAv ?? ''}</div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <div className="px-2 pt-2 text-muted">Ingen bookinger funnet</div>
                )}
            </div>
        </div>
    );
}
