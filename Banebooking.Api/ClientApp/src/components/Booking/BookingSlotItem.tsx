import { useBookingActions } from '../../hooks/useBookingActions';
import { BookingSlotItemHeader } from './BookingSlotItemHeader';
import { BookingSlotItemExpanded } from './BookingSlotItemExpanded';
import type { BookingSlot } from '../../types';

type Props = {
    slot: BookingSlot;
    currentUser: { epost: string } | null;
    isOpen?: boolean;
    onToggle?: () => void;
    onBook?: (slot: BookingSlot) => void;
    onCancel?: (slot: BookingSlot) => void;
    onDelete?: (slot: BookingSlot) => void;
    modus: 'index' | 'minside' | 'arrangement' | 'readonly';
};

export default function BookingSlotItem({
    slot,
    currentUser,
    isOpen = false,
    onToggle,
    onBook = () => { },
    onCancel = () => { },
    onDelete = () => { },
    modus,
}: Props) {
    const { erBekreftet, setErBekreftet, reset } = useBookingActions();

    const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
    const harHandlinger = slot.kanBookes || slot.kanAvbestille || slot.kanSlette;
    const erInteraktiv = currentUser && harHandlinger && !slot.erPassert;

    const handleToggle = () => {
        if (erInteraktiv && onToggle) {
            onToggle();
            if (modus === 'index') setErBekreftet(false);
        }
    };

    return (
        <div
            className={`border rounded shadow-sm p-1 mb-1 ${slot.erPassert ? 'bg-light text-muted' : 'bg-white'}`}
            style={{
                cursor: erInteraktiv ? 'pointer' : 'default',
                opacity: slot.erPassert ? 0.5 : 1,
            }}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button, input, label')) return;
                handleToggle();
            }}
        >
            <BookingSlotItemHeader
                slot={slot}
                isOpen={isOpen}
                erInteraktiv={!!erInteraktiv}
                modus={modus}
            />

            {isOpen && !slot.erPassert && (
                <BookingSlotItemExpanded
                    slot={slot}
                    modus={modus}
                    time={tid}
                    erBekreftet={erBekreftet}
                    setErBekreftet={setErBekreftet}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    reset={reset}
                />
            )}
        </div>
    );
}
