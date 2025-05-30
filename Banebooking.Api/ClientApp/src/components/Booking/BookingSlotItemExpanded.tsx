import { BookingActions } from './BookingActions.js';
import type { BookingSlot } from '../../types/index.js';

type Props = {
    slot: BookingSlot;
    modus: 'index' | 'minside' | 'arrangement' | 'readonly';
    time: string;
    erBekreftet: boolean;
    setErBekreftet: (val: boolean) => void;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
    reset: () => void;
};

export function BookingSlotItemExpanded({
    slot,
    modus,
    time,
    erBekreftet,
    setErBekreftet,
    onBook,
    onCancel,
    onDelete,
    reset,
}: Props) {
    return (
        <div className="mt-2">
            <div className="border rounded p-2 bg-gray-50">
                <BookingActions
                    slot={slot}
                    time={time}
                    erBekreftet={modus === 'index' ? erBekreftet : true}
                    setErBekreftet={modus === 'index' ? setErBekreftet : () => { }}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    reset={reset}
                />
            </div>
        </div>
    );
}
