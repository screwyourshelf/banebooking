import { BookingActions } from './BookingActions';
import type { BookingSlot } from '../../types';

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
        <div className="row mt-1">
            <div className="col">
                <div className="border rounded p-1 bg-light">
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
        </div>
    );
}
