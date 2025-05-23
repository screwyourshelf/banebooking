import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useBruker } from '../hooks/useBruker';
import { avbestillBooking } from '../api/booking';
import MinSideBookingItem from '../components/Booking/MinSideBookingItem';
import type { BookingSlot } from '../types';

export default function MinSide() {
    const { slug } = useParams();
    const [inkluderHistoriske, setInkluderHistoriske] = useState(false);
    const [avbestillerKey, setAvbestillerKey] = useState<string | null>(null);
    const { bruker, laster, error, refetch } = useBruker(slug, inkluderHistoriske);

    const handleAvbestill = async (slot: BookingSlot, key: string) => {
        if (!slug) return;
        setAvbestillerKey(key);

        try {
            await avbestillBooking(slug, slot.baneId, slot.dato, slot.startTid, slot.sluttTid);
            toast.success('Booking avbestilt');
            await refetch(); // Ikke reload
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error('Ukjent feil ved avbestilling');
            }
        } finally {
            setAvbestillerKey(null);
        }
    };

    if (!slug) return <div>Ugyldig klubb-URL.</div>;
    if (error) return <div className="alert alert-danger">Feil: {error}</div>;
    if (laster || !bruker) return <div>Laster brukerdata ...</div>;

    return (
        <div className="container mt-3">
            <h3>Min side</h3>
            <p>Innlogget som: <strong>{bruker.epost}</strong></p>

            <h5 className="mt-4">Mine bookinger</h5>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="visHistoriske"
                    checked={inkluderHistoriske}
                    onChange={(e) => setInkluderHistoriske(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="visHistoriske">
                    Vis historiske bookinger
                </label>
            </div>

            {bruker.bookinger.length === 0 ? (
                <p>Du har ingen bookinger{inkluderHistoriske ? '' : ' fremover'}.</p>
            ) : (
                <div className="d-flex flex-column gap-2">
                    {bruker.bookinger.map((b, i) => {
                        const key = `${b.dato}-${b.startTid}-${b.baneId}-${i}`;
                        return (
                            <MinSideBookingItem
                                key={key}
                                slot={b}
                                isCancelling={avbestillerKey === key}
                                onCancel={() => handleAvbestill(b, key)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
