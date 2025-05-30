import * as React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import * as Popover from '@radix-ui/react-popover';
import { Calendar } from '@/components/ui/calendar.js';
import { Input } from '@/components/ui/input.js';
import { Button } from '@/components/ui/button.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    value: Date | null;
    onChange: (date: Date | undefined) => void;
    minDate?: Date;
};

export default function DatoVelger({ value, onChange, minDate }: Props) {
    const [open, setOpen] = React.useState(false);
    const dato = value ?? null;

    const velgDato = (date: Date | undefined) => {
        if (!date) return;
        if (minDate && date < minDate) return;
        onChange(date);
        setOpen(false);
    };

    const forrigeDag = () => {
        if (dato) onChange(subDays(dato, 1));
    };

    const nesteDag = () => {
        if (dato) onChange(addDays(dato, 1));
    };

    return (
        <div className="flex items-center gap-1">
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <Input
                        readOnly
                        value={dato ? format(dato, 'dd.MM.yyyy') : ''}
                        className="w-[110px] text-sm px-2 py-1.5 h-8 cursor-pointer"
                        aria-label="Velg dato"
                    />
                </Popover.Trigger>

                <Popover.Content
                    side="bottom"
                    align="start"
                    className="z-50 w-auto rounded-md border border-gray-200 bg-white p-2 shadow-lg"
                >
                    <Calendar
                        mode="single"
                        selected={dato ?? undefined}
                        onSelect={velgDato}
                        locale={nb}
                        weekStartsOn={1}
                    />
                </Popover.Content>
            </Popover.Root>

            <Button
                variant="outline"
                size="icon"
                onClick={forrigeDag}
                aria-label="Forrige dag"
                className="h-8 w-8"
            >
                <ChevronLeft />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={nesteDag}
                aria-label="Neste dag"
                className="h-8 w-8"
            >
                <ChevronRight />
            </Button>
        </div>
    );
}
