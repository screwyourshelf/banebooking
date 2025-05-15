import { useState } from 'react';
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
    const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);

    if (!slots.length) {
        return <div className="px-1 pt-1 text-muted">Ingen bookinger funnet</div>;
    }

    return (
        <div className="d-flex flex-column gap-1 w-100">
            {slots.map((slot) => (
                <BookingSlotItem
                    key={slot.startTid}
                    slot={slot}
                    currentUser={currentUser}
                    isAdmin={isAdmin}
                    isOpen={apenSlotTid === slot.startTid}
                    onToggle={() =>
                        setApenSlotTid((prev) =>
                            prev === slot.startTid ? null : slot.startTid
                        )
                    }
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onReportNoShow={onReportNoShow}
                />
            ))}
        </div>
    );
}
