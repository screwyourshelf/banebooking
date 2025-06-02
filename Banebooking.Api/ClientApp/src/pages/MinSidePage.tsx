import { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMineBookinger } from '../hooks/useMineBookinger.js';
import { useArrangement } from '../hooks/useArrangement.js';
import { SlugContext } from '../layouts/Layout.js';
import Spinner from '@/components/ui/spinner.js';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table.js';
import { formatDatoKort } from '../utils/datoUtils.js';

export default function MinSidePage() {
    const { slug: slugFraParams } = useParams<{ slug: string }>();
    const slug = useContext(SlugContext) ?? slugFraParams;

    const { bookinger, laster } = useMineBookinger(slug ?? '');
    const { arrangementer, loading: lasterArrangementer } = useArrangement(slug);

    const grupperteBookinger = useMemo(() => {
        const grupper: Record<string, typeof bookinger> = {};

        for (const slot of bookinger) {
            if (!grupper[slot.dato]) {
                grupper[slot.dato] = [];
            }
            grupper[slot.dato].push(slot);
        }

        return Object.entries(grupper).sort(([datoA], [datoB]) => datoA.localeCompare(datoB));
    }, [bookinger]);

    if (laster || lasterArrangementer) {
        return (
            <div className="flex justify-center py-4">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-screen-sm mx-auto px-1 py-1">
            <h2 className="text-base font-semibold mb-2">Mine kommende bookinger</h2>

            {grupperteBookinger.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Ingen aktive bookinger funnet.</p>
            ) : (
                <div className="overflow-auto max-h-[60vh] border rounded-md mb-6">
                    <Table className="text-sm table-fixed w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/4">Dato</TableHead>
                                <TableHead className="w-1/4">Klokkeslett</TableHead>
                                <TableHead className="w-2/4">Bane</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grupperteBookinger.flatMap(([dato, slots]) =>
                                slots.map((slot) => (
                                    <TableRow key={`${dato}-${slot.baneId}-${slot.startTid}`}>
                                        <TableCell>{formatDatoKort(dato)}</TableCell>
                                        <TableCell>{slot.startTid} – {slot.sluttTid}</TableCell>
                                        <TableCell>{slot.baneNavn ?? '(ukjent bane)'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                </div>
            )}

            {arrangementer.length > 0 && (
                <>
                    <h2 className="text-base font-semibold mb-2">Kommende arrangementer</h2>

                    <div className="overflow-auto max-h-[60vh] border rounded-md mb-6">
                        <Table className="text-sm table-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">Hva</TableHead>
                                    <TableHead className="w-2/5">Når</TableHead>
                                    <TableHead className="w-1/5 text-right">Om</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {arrangementer.map((arr) => {
                                    const start = new Date(arr.startDato);
                                    const today = new Date();
                                    const dagerIgjen = Math.max(
                                        0,
                                        Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                    );

                                    return (
                                        <TableRow
                                            key={arr.id}
                                            className={[
                                                'border-b',
                                                'transition-colors duration-300 ease-in-out',
                                                'bg-gradient-to-r from-blue-0 via-blue-50 to-blue-200',
                                            ].join(' ')}
                                        >

                                            <TableCell className="whitespace-normal break-words">
                                                <div className="font-medium">{arr.tittel}</div>
                                                {arr.beskrivelse && (
                                                    <div className="text-muted-foreground text-xs whitespace-normal break-words">
                                                        {arr.beskrivelse}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {arr.startDato === arr.sluttDato
                                                    ? formatDatoKort(arr.startDato)
                                                    : `${formatDatoKort(arr.startDato)} – ${formatDatoKort(arr.sluttDato)}`}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                {dagerIgjen} {dagerIgjen === 1 ? 'dag' : 'dager'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                    </div>
                </>
            )}
        </div>
    );
}
