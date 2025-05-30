import type { BookingSlot } from '../../types/index.js';
import { Button } from '@/components/ui/button.js';
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
            className={`border rounded shadow-sm p-4 text-sm ${slot.erPassert ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900'
                }`}
            style={{ opacity: slot.erPassert ? 0.5 : 1 }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <div>
                        <strong>Dato:</strong> {slot.dato}
                    </div>
                    <div>
                        <strong>Bane:</strong> {slot.baneNavn ?? '(ukjent bane)'}
                    </div>
                    <div>
                        <strong>Tid:</strong> {tid}
                    </div>
                </div>

                {slot.kanAvbestille && (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onCancel}
                        disabled={isCancelling}
                        className="flex items-center gap-2"
                    >
                        <FaTimesCircle />
                        {isCancelling ? 'Avbestiller...' : 'Avbestill'}
                    </Button>
                )}
            </div>
        </div>
    );
}
