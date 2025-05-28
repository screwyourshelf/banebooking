import { FaChevronDown } from 'react-icons/fa';
import type { BookingSlot } from '../../types';

type Props = {
    slot: BookingSlot;
    isOpen: boolean;
    erInteraktiv: boolean;
    modus: 'index' | 'minside' | 'arrangement' | 'readonly';
};

export function BookingSlotItemHeader({
    slot,
    isOpen,
    erInteraktiv,
    modus
}: Props) {
    const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;

    const visNavn = slot.bookingtype && slot.bookingtype !== 'medlem'
        ? `${slot.bookingtype}${slot.kommentar ? ' – ' + slot.kommentar : ''}`
        : slot.booketAv ?? 'Ledig';

    return (
        <>
            {modus !== 'index' && (
                <div className="d-flex justify-content-between small text-muted px-1">
                    <div>{slot.baneNavn ?? '(ukjent bane)'}</div>
                </div>
            )}

            <div className="d-flex align-items-center">
                <div style={{ flex: 1 }} className="d-flex align-items-center justify-content-between">
                    {/* Tid */}
                    <div className="text-nowrap fw-semibold small text-end pe-1">
                        {tid}
                    </div>

                    {/* Værikon */}
                    <div className="d-flex justify-content-center align-items-center">
                        {slot.værSymbol && (
                            <img
                                src={`/weather-symbols/svg/${slot.værSymbol}.svg`}
                                alt={slot.værSymbol}
                                width={16}
                                height={16}
                            />
                        )}
                    </div>

                    {/* Navn eller type */}
                    <div className="flex-grow-1 small text-break p-1">
                        {visNavn}
                    </div>

                    {/* Pilindikator */}
                    {erInteraktiv && (
                        <div className="p-1">
                            <FaChevronDown
                                size={12}
                                style={{
                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
