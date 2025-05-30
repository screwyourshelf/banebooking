import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ukedager, dagNavnTilEnum } from '../../utils/datoUtils.js';
import { useMassebooking } from '../../hooks/useMassebooking.js';
import type { MassebookingDto } from '../../types/index.js';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table.js";

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.js';
import { Button } from '@/components/ui/button.js';
import { Card } from '@/components/ui/card.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Label } from '@/components/ui/label.js';
import Spinner from '../../components/ui/spinner.js';
import DatoPeriodeVelger from '../../components/DatoPeriodeVelger.js';
import { Input } from "@/components/ui/input.js" 

export default function MassebookingPage() {
    const { slug } = useParams<{ slug: string }>();
    const {
        baner,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        setForhandsvisning,
        forhandsvis,
        opprett,
        loading,
    } = useMassebooking(slug);

    const [valgteBaner, setValgteBaner] = useState<string[]>([]);
    const [valgteUkedager, setValgteUkedager] = useState<string[]>([]);
    const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
    const [datoFra, setDatoFra] = useState<Date | null>(new Date());
    const [datoTil, setDatoTil] = useState<Date | null>(new Date());
    const [alleBaner, setAlleBaner] = useState(false);
    const [alleUkedager, setAlleUkedager] = useState(false);
    const [alleTidspunkter, setAlleTidspunkter] = useState(false);
    const [bookingtype, setBookingtype] = useState('admin');
    const [kommentar, setKommentar] = useState('');
    const [activeTab, setActiveTab] = useState('oppsett');

    const nullstillForhandsvisning = () => setForhandsvisning({ ledige: [], konflikter: [] });

    const tilgjengeligeUkedager = useMemo(() => {
        if (!datoFra || !datoTil) return ukedager;
        const dager = new Set<string>();
        const cursor = new Date(datoFra);
        while (cursor <= datoTil) {
            const dag = ukedager[cursor.getDay() === 0 ? 6 : cursor.getDay() - 1];
            dager.add(dag);
            cursor.setDate(cursor.getDate() + 1);
        }
        return Array.from(dager);
    }, [datoFra, datoTil]);

    useEffect(() => {
        if (alleBaner) setValgteBaner(baner.map(b => b.id));
        if (alleUkedager) setValgteUkedager(tilgjengeligeUkedager);
        if (alleTidspunkter) setValgteTidspunkter(tilgjengeligeTidspunkter);
    }, [alleBaner, alleUkedager, alleTidspunkter, baner, tilgjengeligeUkedager, tilgjengeligeTidspunkter]);

    const toggle = (item: string, set: React.Dispatch<React.SetStateAction<string[]>>) => {
        set(prev => (prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]));
    };

    const byggDto = (): MassebookingDto | null => {
        if (!datoFra || !datoTil || valgteBaner.length === 0 || valgteUkedager.length === 0 || valgteTidspunkter.length === 0)
            return null;

        return {
            startDato: datoFra.toISOString().split('T')[0],
            sluttDato: datoTil.toISOString().split('T')[0],
            ukedager: valgteUkedager.map(d => dagNavnTilEnum[d]),
            tidspunkter: valgteTidspunkter,
            baneIder: valgteBaner,
            bookingtype,
            kommentar,
        };
    };

    const håndterOpprett = async () => {
        const dto = byggDto();
        if (dto) {
            await opprett(dto);
            nullstillForhandsvisning();
            setActiveTab('oppsett');
        }
    };

    const håndterTabChange = async (valgt: string) => {
        setActiveTab(valgt);
        if (valgt === 'forhandsvisning') {
            const dto = byggDto();
            if (dto) await forhandsvis(dto);
        }
    };

    return (
        <div className="max-w-screen-md mx-auto px-2 py-3">
            <Card className="p-4">
                {loading ? (
                    <div className="text-center py-10">
                        <Spinner />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={håndterTabChange}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="oppsett">Oppsett</TabsTrigger>
                            <TabsTrigger value="forhandsvisning" disabled={valgteBaner.length === 0}>
                                Forhåndsvisning ({forhandsvisning.ledige.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="oppsett" className="space-y-4">
                            <div>
                                <Label>Type booking</Label>
                                <select
                                    className="w-full border rounded text-sm px-3 py-2 mt-1"
                                    value={bookingtype}
                                    onChange={e => setBookingtype(e.target.value)}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="kurs">Kurs</option>
                                    <option value="trening">Trening</option>
                                    <option value="turnering">Turnering</option>
                                </select>
                            </div>

                            <div>
                                <Label>Beskrivelse</Label>
                                <Input
                                    type="text"
                                    className="w-full text-sm mt-1"
                                    value={kommentar}
                                    onChange={e => setKommentar(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="inline-flex items-center gap-2">
                                    <Checkbox checked={alleBaner} onCheckedChange={val => setAlleBaner(!!val)} />
                                    Alle baner
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {baner.map(b => (
                                        <Button
                                            key={b.id}
                                            variant={valgteBaner.includes(b.id) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => toggle(b.id, setValgteBaner)}
                                            disabled={alleBaner}
                                        >
                                            {b.navn}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Periode</Label>
                                <DatoPeriodeVelger
                                    fra={datoFra}
                                    til={datoTil}
                                    onChange={(fra, til) => {
                                        setDatoFra(fra);
                                        setDatoTil(til);
                                    }}
                                    minDate={new Date()}
                                />
                            </div>

                            <div>
                                <Label className="inline-flex items-center gap-2">
                                    <Checkbox checked={alleUkedager} onCheckedChange={val => setAlleUkedager(!!val)} />
                                    Alle gyldige dager
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {ukedager.map(dag => (
                                        <Button
                                            key={dag}
                                            variant={valgteUkedager.includes(dag) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={e => {
                                                e.preventDefault();
                                                toggle(dag, setValgteUkedager);
                                            }}
                                            disabled={alleUkedager || !tilgjengeligeUkedager.includes(dag)}
                                        >
                                            {dag}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="inline-flex items-center gap-2">
                                    <Checkbox checked={alleTidspunkter} onCheckedChange={val => setAlleTidspunkter(!!val)} />
                                    Alle tidspunkter
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tilgjengeligeTidspunkter.map(tid => (
                                        <Button
                                            key={tid}
                                            variant={valgteTidspunkter.includes(tid) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => toggle(tid, setValgteTidspunkter)}
                                            disabled={alleTidspunkter}
                                        >
                                            {tid}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="forhandsvisning">
                            {forhandsvisning.ledige.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Ingen bookinger tilgjengelig.</p>
                            ) : (
                                <>
                                    <div className="overflow-auto max-h-[60vh] border rounded-md">
                                        <Table className="text-sm">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Dato</TableHead>
                                                    <TableHead>Klokkeslett</TableHead>
                                                    <TableHead>Bane</TableHead>
                                                    <TableHead>Kommentar</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {forhandsvisning.ledige.map((slot) => {
                                                    const bane = baner.find((b) => b.id === slot.baneId);
                                                    return (
                                                        <TableRow key={`${slot.dato}-${slot.baneId}-${slot.startTid}`}>
                                                            <TableCell>{slot.dato}</TableCell>
                                                            <TableCell>
                                                                {slot.startTid} – {slot.sluttTid}
                                                            </TableCell>
                                                            <TableCell>{bane?.navn ?? "(ukjent bane)"}</TableCell>
                                                            <TableCell>{kommentar}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="flex justify-end mt-3">
                                        <Button type="button" onClick={håndterOpprett} disabled={loading}>
                                            Opprett {forhandsvisning.ledige.length} bookinger
                                        </Button>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                    </Tabs>
                )}
            </Card>
        </div>
    );
}
