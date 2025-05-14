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
        return <div className="px-2 pt-2 text-muted">Ingen bookinger funnet</div>;
    }

    return (
        <div className="d-flex flex-column gap-2 w-100">
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
