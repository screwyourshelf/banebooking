import { FaChevronDown } from 'react-icons/fa';
import type { BookingSlot } from '../../types/index.js';

type Props = {
    slot: BookingSlot;
    isOpen: boolean;
    erInteraktiv: boolean;
};

export function BookingSlotItemHeader({ slot, isOpen, erInteraktiv }: Props) {
    const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;

    const visNavn = slot.arrangementTittel
        ? `${slot.arrangementTittel}${slot.arrangementBeskrivelse ? ' – ' + slot.arrangementBeskrivelse : ''}`
        : slot.booketAv ?? 'Ledig';

    return (
        <>
            

            <div className="flex items-center">
                <div className="flex flex-1 items-center justify-between">
                    {/* Tid */}
                    <div className="whitespace-nowrap font-semibold text-sm text-right pr-1">
                        {tid}
                    </div>

                    {/* Værikon */}
                    <div className="flex justify-center items-center">
                        {slot.værSymbol && (
                            <img
                                src={`/weather-symbols/svg/${slot.værSymbol}.svg`}
                                alt={slot.værSymbol}
                                width={16}
                                height={16}
                                className="select-none"
                                draggable={false}
                            />
                        )}
                    </div>

                    {/* Navn eller type */}
                    <div className="flex-grow text-sm break-words p-1">
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
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
