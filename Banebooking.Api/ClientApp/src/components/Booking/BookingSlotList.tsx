import type { BookingSlot } from '../../types';
import type { User } from '@supabase/supabase-js';
import BookingSlotItem from './BookingSlotItem';

type Props = {
    slots: BookingSlot[];
    currentUser: User | null;
    isAdmin: boolean;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
    onReportNoShow: (slot: BookingSlot) => void;
};

export default function BookingSlotList({
    slots,
    currentUser,
    isAdmin,
    onBook,
    onCancel,
    onDelete,
    onReportNoShow,
}: Props) {
    if (!slots.length) {
        return <div className="px-1 pt-1 text-muted">Ingen bookinger funnet</div>;
    }

    return (
        <div className="d-flex flex-column gap-1 w-100">
            {slots.map((slot, index) => (
                <BookingSlotItem
                    key={index}
                    slot={slot}
                    currentUser={currentUser}
                    isAdmin={isAdmin}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onReportNoShow={onReportNoShow}
                />
            ))}
        </div>
    );
}
