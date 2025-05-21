import { useBookingActions } from '../../hooks/useBookingActions';
import { BookingActions } from './BookingActions';
import { FaChevronDown } from 'react-icons/fa';
import type { BookingSlot } from '../../types';
import type { User } from '@supabase/supabase-js';

type Props = {
    slot: BookingSlot;
    currentUser: User | null;
    isOpen: boolean;
    onToggle: () => void;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
};

export default function BookingSlotItem({
    slot,
    currentUser,
    isOpen,
    onToggle,
    onBook,
    onCancel,
    onDelete,
}: Props) {
    const { erBekreftet, setErBekreftet, reset } = useBookingActions();
    const time = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
    const harHandlinger = slot.kanBookes || slot.kanAvbestille || slot.kanSlette;

    const handleToggle = () => {
        if (currentUser && harHandlinger) {
            onToggle();
            setErBekreftet(false);
        }
    };

    return (
        <div
            className="border rounded shadow-sm p-1 bg-white mb-1"
            style={{ cursor: currentUser && harHandlinger ? 'pointer' : 'default' }}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button, input, label')) return;
                handleToggle();
            }}
        >
            <div className="d-flex align-items-center justify-content-between gap-1">

                {/* Tid */}
                <div
                    className="text-nowrap fw-semibold small text-end"
                >
                    {time}
                </div>

                {/* Værikon */}
                <div
                    className="d-flex justify-content-center align-items-center"
                >
                    {slot.værSymbol && (
                        <img
                            src={`/weather-symbols/svg/${slot.værSymbol}.svg`}
                            alt={slot.værSymbol}
                            width={16}
                            height={16}
                        />
                    )}
                </div>

                {/* Booket av / Ledig */}
                <div className="flex-grow-1 small text-break px-1">
                    {slot.booketAv ?? 'Ledig'}
                </div>

                {/* Pilindikator */}
                {currentUser && harHandlinger && (
                    <div className="p-1">
                        <FaChevronDown
                            size={12}
                            style={{
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Ekspandert visning */}
            {isOpen && (
                <div className="row mt-1">
                    <div className="col">
                        <div className="border rounded p-1 bg-light">
                            <BookingActions
                                slot={slot}
                                time={time}
                                erBekreftet={erBekreftet}
                                setErBekreftet={setErBekreftet}
                                onBook={onBook}
                                onCancel={onCancel}
                                onDelete={onDelete}
                                reset={reset}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
