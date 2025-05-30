import { addDays, subDays, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { Button } from '@/components/ui/button.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type Props = {
    value: Date | null;
    onChange: (date: Date) => void;
    minDate?: Date;
};

export default function DatoVelger({ value, onChange, minDate }: Props) {
    const [visKalender, setVisKalender] = useState(false);

    const velgDato = (dato: Date | undefined) => {
        if (!dato) return;
        if (minDate && dato < minDate) return;
        onChange(dato);
        setVisKalender(false);
    };

    const forrigeDag = () => {
        if (value) onChange(subDays(value, 1));
    };

    const nesteDag = () => {
        if (value) onChange(addDays(value, 1));
    };

    const visningsformat = value ? format(value, 'dd.MM.yyyy', { locale: nb }) : 'Velg dato';

    return (
        <div className="flex items-center gap-1 relative">
            <Button
                variant="outline"
                className="h-8 px-2 text-sm"
                onClick={() => setVisKalender(!visKalender)}
            >
                {visningsformat}
            </Button>

            {visKalender && (
                <div className="absolute z-10 top-10 left-0 bg-white shadow border rounded-md">
                    <DayPicker
                        mode="single"
                        selected={value ?? undefined}
                        onSelect={velgDato}
                        locale={nb}
                        fromDate={minDate}
                    />
                </div>
            )}

            <Button variant="outline" size="icon" onClick={forrigeDag} className="h-8 w-8">
                <ChevronLeft />
            </Button>

            <Button variant="outline" size="icon" onClick={nesteDag} className="h-8 w-8">
                <ChevronRight />
            </Button>
        </div>
    );
}
