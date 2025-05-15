import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
    FaChevronDown,
    FaCalendarPlus,
    FaUserSlash,
    FaTimesCircle,
    FaTrashAlt
} from 'react-icons/fa';
import type { BookingSlot } from '../../types';
import type { User } from '@supabase/supabase-js';

type Props = {
    slot: BookingSlot;
    currentUser: User | null;
    isAdmin: boolean;
    isOpen: boolean;
    onToggle: () => void;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
    onReportNoShow: (slot: BookingSlot) => void;
};

export default function BookingSlotItem({
    slot,
    currentUser,
    isOpen,
    onToggle,
    onBook,
    onCancel,
    onDelete,
    onReportNoShow,
}: Props) {
    const [erBekreftet, setErBekreftet] = useState(false);
    const time = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;

    const reset = () => {
        setErBekreftet(false);
    };

    const harHandlinger =
        slot.kanBookes || slot.kanAvbestille || slot.kanSlette || slot.kanRapportereFravaer;

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
                <div className="mt-2 w-100 border rounded p-1 bg-light d-flex flex-column align-items-end">
                    {slot.kanBookes && (
                        <>
                            <Form.Check
                                id={`book-${time}`}
                                type="checkbox"
                                label="Jeg bekrefter at jeg er medlem for inneværende år"
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

                    {slot.kanRapportereFravaer && (
                        <>
                            <Form.Check
                                id={`no-show-${time}`}
                                type="checkbox"
                                label="Jeg bekrefter at medlemmet som hadde booket banen ikke møtte opp."
                                checked={erBekreftet}
                                onChange={(e) => setErBekreftet(e.target.checked)}
                                className="mb-2 mt-1 small"
                            />
                            <Button
                                size="sm"
                                variant="outline-dark"
                                disabled={!erBekreftet}
                                onClick={() => {
                                    onReportNoShow(slot);
                                    reset();
                                }}
                                className="d-flex align-items-center gap-2 small"
                            >
                                <FaUserSlash />
                                Marker som ikke møtt
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
