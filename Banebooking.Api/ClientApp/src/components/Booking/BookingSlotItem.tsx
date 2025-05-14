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
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
    onReportNoShow: (slot: BookingSlot) => void;
};

export default function BookingSlotItem({
    slot,
    currentUser,
    isAdmin,
    onBook,
    onCancel,
    onDelete,
    onReportNoShow,
}: Props) {
    const [visValg, setVisValg] = useState(false);
    const [erBekreftet, setErBekreftet] = useState(false);

    const time = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
    const erEier = currentUser?.email === slot.booketAv;

    const reset = () => {
        setErBekreftet(false);
        setVisValg(false);
    };

    return (
        <div className="border rounded shadow-sm p-2 w-100 bg-white">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <span className="fw-semibold border-end pe-2 text-nowrap">{time}</span>
                    <span className="ps-2 text-break">
                        {slot.booketAv ? slot.booketAv : 'Ledig'}
                    </span>
                </div>

                {currentUser && (
                    <button
                        className="btn btn-link btn-sm text-secondary"
                        onClick={() => {
                            setVisValg(!visValg);
                            setErBekreftet(false);
                        }}
                        aria-label="Vis alternativer"
                        style={{
                            transform: visValg ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                        }}
                    >
                        <FaChevronDown />
                    </button>
                )}
            </div>

            {visValg && (
                <div className="mt-2 w-100 border rounded p-1 bg-light d-flex flex-column align-items-end">
                    {slot.kanBookes && !slot.booketAv && (
                        <>
                            <Form.Check
                                id={`bekreft-${time}`}
                                type="checkbox"
                                label="Jeg bekrefter at jeg er medlem for inneværende år"
                                checked={erBekreftet}
                                onChange={(e) => setErBekreftet(e.target.checked)}
                                className="mb-2"
                            />
                            <Button
                                size="sm"
                                variant="outline-dark"
                                disabled={!erBekreftet}
                                onClick={() => {
                                    onBook(slot);
                                    reset();
                                }}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaCalendarPlus />
                                Book
                            </Button>
                        </>
                    )}

                    {erEier && (
                        <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                                onCancel(slot);
                                reset();
                            }}
                            className="mt-1 d-flex align-items-center gap-2"
                        >
                            <FaTimesCircle />
                            Avbestill
                        </Button>
                    )}

                    {isAdmin && slot.booketAv && !erEier && (
                        <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                                onDelete(slot);
                                reset();
                            }}
                            className="mt-1 d-flex align-items-center gap-2"
                        >
                            <FaTrashAlt />
                            Slett
                        </Button>
                    )}

                    {slot.booketAv && !erEier && (
                        <>
                            <Form.Check
                                id={`no-show-${time}`}
                                type="checkbox"
                                label="Jeg bekrefter at medlemmet som hadde booket banen ikke møtte opp."
                                checked={erBekreftet}
                                onChange={(e) => setErBekreftet(e.target.checked)}
                                className="mb-2 mt-1"
                            />
                            <Button
                                size="sm"
                                variant="outline-dark"
                                disabled={!erBekreftet}
                                onClick={() => {
                                    onReportNoShow(slot);
                                    reset();
                                }}
                                className="d-flex align-items-center gap-2"
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
