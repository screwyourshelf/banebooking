import { Button, Form } from 'react-bootstrap';
import { FaCalendarPlus, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';
import type { BookingSlot } from '../../types';

type Props = {
    slot: BookingSlot;
    time: string;
    erBekreftet: boolean;
    setErBekreftet: (val: boolean) => void;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
    reset: () => void;
};

export function BookingActions({
    slot,
    time,
    erBekreftet,
    setErBekreftet,
    onBook,
    onCancel,
    onDelete,
    reset
}: Props) {
    return (
        <div className="d-flex flex-column align-items-end w-100">
            {slot.kanBookes && (
                <>
                    <Form.Check
                        id={`book-${time}`}
                        type="checkbox"
                        label={`Jeg (og de jeg spiller sammen med) har betalt medlemskap for ${new Date().getFullYear()}`}
                        checked={erBekreftet}
                        onChange={(e) => setErBekreftet(e.target.checked)}
                        className="mb-2 small"
                    />

                    <Button
                        size="sm"
                        variant="outline-dark"
                        disabled={!erBekreftet}
                        onClick={() => {
                            onBook(slot);
                            reset();
                        }}
                        className="d-flex align-items-center gap-2 small"
                    >
                        <FaCalendarPlus />
                        Book
                    </Button>
                </>
            )}

            {slot.kanAvbestille && (
                <Button
                    size="sm"
                    variant="outline-dark"
                    onClick={() => {
                        onCancel(slot);
                        reset();
                    }}
                    className="mt-1 d-flex align-items-center gap-2 small"
                >
                    <FaTimesCircle />
                    Avbestill
                </Button>
            )}

            {slot.kanSlette && (
                <Button
                    size="sm"
                    variant="outline-dark"
                    onClick={() => {
                        onDelete(slot);
                        reset();
                    }}
                    className="mt-1 d-flex align-items-center gap-2 small"
                >
                    <FaTrashAlt />
                    Slett
                </Button>
            )}
        </div>
    );
}
