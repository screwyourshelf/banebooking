import type { BookingSlot } from '../../types';
import BookingSlotItem from './BookingSlotItem';

type Props = {
    slots: BookingSlot[];
    currentUser: { epost: string } | null;
    modus: 'index' | 'minside' | 'arrangement' | 'readonly';
    onBook?: (slot: BookingSlot) => void;
    onCancel?: (slot: BookingSlot) => void;
    onDelete?: (slot: BookingSlot) => void;
    apenSlotTid?: string | null;
    setApenSlotTid?: (tid: string | null) => void;
};

export function BookingSlotList({
    slots,
    currentUser,
    modus,
    onBook,
    onCancel,
    onDelete,
    apenSlotTid,
    setApenSlotTid
}: Props) {
    if (slots.length === 0) {
        return <div className="text-muted small">Ingen bookinger eller slots å vise.</div>;
    }

    return (
        <div>
            {slots.map((slot) => {
                const slotKey = `${slot.dato}-${slot.startTid}-${slot.baneId}`;

                return (
                    <BookingSlotItem
                        key={slotKey}
                        slot={slot}
                        currentUser={currentUser}
                        modus={modus}
                        onBook={onBook}
                        onCancel={onCancel}
                        onDelete={onDelete}
                        isOpen={apenSlotTid === slotKey}
                        onToggle={() =>
                            setApenSlotTid?.(
                                apenSlotTid === slotKey ? null : slotKey
                            )
                        }
                    />
                );
            })}
        </div>
    );
}
