import { useState, useContext } from 'react';
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs.js';
import { formatDatoKort } from '../utils/datoUtils.js';

export default function MinSidePage() {
    const { slug: slugFraParams } = useParams<{ slug: string }>();
    const slug = useContext(SlugContext) ?? slugFraParams;

    const [tab, setTab] = useState('bookinger');

    const { bookinger, laster: lasterBookinger } = useMineBookinger(slug);
    const { arrangementer, loading: lasterArrangementer } = useArrangement(slug);

    return (
        <div className="max-w-screen-md mx-auto px-1 py-1">

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="bookinger">Mine bookinger</TabsTrigger>
                    <TabsTrigger value="arrangementer">Arrangementer</TabsTrigger>
                </TabsList>

                <TabsContent value="bookinger">
                    {lasterBookinger ? (
                        <div className="text-center py-10">
                            <Spinner />
                        </div>
                    ) : bookinger.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            Du har ingen kommende bookinger.
                        </p>
                    ) : (
                        <div className="overflow-auto max-h-[60vh] border-b border-x rounded-b-md">
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dato</TableHead>
                                        <TableHead>Tid</TableHead>
                                        <TableHead>Bane</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookinger.map((b, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{formatDatoKort(b.dato)}</TableCell>
                                            <TableCell>{b.startTid}–{b.sluttTid}</TableCell>
                                            <TableCell>{b.baneNavn}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="arrangementer">
                    {lasterArrangementer ? (
                        <div className="text-center py-10">
                            <Spinner />
                        </div>
                    ) : arrangementer.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            Ingen arrangementer registrert.
                        </p>
                    ) : (
                        <div className="overflow-auto max-h-[60vh] border-b border-x rounded-b-md">
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/6">Hva</TableHead>
                                        <TableHead className="w-2/6">Når</TableHead>
                                        <TableHead className="w-2/6">Om</TableHead>
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
                                            <TableRow key={arr.id}>
                                                <TableCell className="whitespace-normal break-words">
                                                    <div className="font-medium">{arr.tittel}</div>
                                                    {arr.beskrivelse && (
                                                        <div className="text-muted-foreground text-xs whitespace-normal break-words">
                                                            {arr.beskrivelse}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-words text-sm">
                                                    {arr.startDato === arr.sluttDato
                                                        ? formatDatoKort(arr.startDato)
                                                        : `${formatDatoKort(arr.startDato)} - ${formatDatoKort(arr.sluttDato)}`}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {dagerIgjen} {dagerIgjen === 1 ? 'dag' : 'dager'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
