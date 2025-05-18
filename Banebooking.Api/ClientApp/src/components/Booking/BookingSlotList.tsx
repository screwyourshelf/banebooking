import type { BookingSlot } from '../../types';
import type { User } from '@supabase/supabase-js';
import BookingSlotItem from './BookingSlotItem';

type Props = {
    slots: BookingSlot[];
    currentUser: User | null;
    apenSlotTid: string | null;
    setApenSlotTid: React.Dispatch<React.SetStateAction<string | null>>;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
};

export default function BookingSlotList({
    slots,
    currentUser,
    apenSlotTid,
    setApenSlotTid,
    onBook,
    onCancel,
    onDelete,
}: Props) {
    if (!slots.length) {
        return <div className="px-1 pt-1 text-muted">Ingen bookinger funnet</div>;
    }

    const toggleSlot = (startTid: string) => {
        setApenSlotTid((prev) => (prev === startTid ? null : startTid));
    };

    return (
        <div className="d-flex flex-column gap-1 w-100">
            {slots.map((slot) => (
                <BookingSlotItem
                    key={slot.startTid}
                    slot={slot}
                    currentUser={currentUser}
                    isOpen={apenSlotTid === slot.startTid}
                    onToggle={() => toggleSlot(slot.startTid)}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
