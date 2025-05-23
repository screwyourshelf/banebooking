import type { BookingSlot } from '../../types';
import { Button } from 'react-bootstrap';
import { FaTimesCircle } from 'react-icons/fa';

type Props = {
    slot: BookingSlot;
    isCancelling: boolean;
    onCancel: () => void;
};

export default function MinSideBookingItem({ slot, isCancelling, onCancel }: Props) {
    const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;

    return (
        <div
            className={`border rounded shadow-sm p-2 small ${slot.erPassert ? 'bg-light text-muted' : 'bg-white'}`}
            style={{ opacity: slot.erPassert ? 0.5 : 1 }}
        >
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <div><strong>Dato:</strong> {slot.dato}</div>
                    <div><strong>Bane:</strong> {slot.baneNavn ?? '(ukjent bane)'}</div>
                    <div><strong>Tid:</strong> {tid}</div>
                </div>

                {slot.kanAvbestille && (
                    <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={onCancel}
                        disabled={isCancelling}
                        className="d-flex align-items-center gap-2"
                    >
                        <FaTimesCircle />
                        {isCancelling ? 'Avbestiller...' : 'Avbestill'}
                    </Button>
                )}
            </div>
        </div>
    );
}
