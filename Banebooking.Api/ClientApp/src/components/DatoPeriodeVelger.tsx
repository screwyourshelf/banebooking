import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button.js'
import { Calendar } from '@/components/ui/calendar.js'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.js'

type Props = {
    fra: Date | null
    til: Date | null
    onChange: (fra: Date | null, til: Date | null) => void
    minDate?: Date
}

export default function DatoPeriodeVelger({ fra, til, onChange, minDate }: Props) {
    const [range, setRange] = useState<DateRange | undefined>({
        from: fra ?? undefined,
        to: til ?? undefined,
    })

    useEffect(() => {
        onChange(range?.from ?? null, range?.to ?? null)
    }, [range])

    const visningstekst = range?.from
        ? range.to
            ? `${format(range.from, 'dd.MM.yyyy')} - ${format(range.to, 'dd.MM.yyyy')}`
            : format(range.from, 'dd.MM.yyyy')
        : 'Velg periode'

    return (
        <div className="flex items-center gap-1">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-8 px-2 text-sm w-[240px] justify-start text-left"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {visningstekst}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                        locale={nb}
                        fromDate={minDate}
                        numberOfMonths={2}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
