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

    const harHandlinger =
        slot.kanBookes || slot.kanAvbestille || slot.kanSlette;

    return (
        <div className="border rounded shadow-sm p-1 w-100 bg-white">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <span className="fw-semibold border-end pe-1 text-nowrap">{time}</span>
                    <span className="ps-2 text-break">
                        {slot.booketAv ? slot.booketAv : 'Ledig'}
                    </span>
                </div>

                {currentUser && (
                    harHandlinger ? (
                        <button
                            className="btn btn-link btn-sm text-secondary p-0"
                            onClick={() => {
                                onToggle();
                                setErBekreftet(false);
                            }}
                            aria-label="Vis alternativer"
                            style={{
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                            }}
                        >
                            <FaChevronDown />
                        </button>
                    ) : (
                        <div style={{ width: '2rem', height: '1.5rem' }} />
                    )
                )}
            </div>

            {isOpen && (
                <div className="mt-2 w-100 border rounded p-1 bg-light">
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
            )}
        </div>
    );
}
