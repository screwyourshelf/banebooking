import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ukedager, dagNavnTilEnum } from '../../utils/datoUtils.js';
import { useMassebooking } from '../../hooks/useMassebooking.js';
import type { MassebookingDto } from '../../types/index.js';
import { BookingSlotList } from '../../components/Booking/BookingSlotList.js';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.js';
import { Button } from '@/components/ui/button.js';
import { Card } from '@/components/ui/card.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Label } from '@/components/ui/label.js';
import Spinner from '../../components/ui/spinner.js';

import DatoVelger from '../../components/DatoVelger.js';

export default function MassebookingPage() {
    const { slug } = useParams<{ slug: string }>();
    const {
        klubb,
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

    const grupperteSlots = useMemo(() => {
        const grupper: Record<string, typeof forhandsvisning.ledige> = {};
        forhandsvisning.ledige.forEach(slot => {
            if (!grupper[slot.dato]) grupper[slot.dato] = [];
            grupper[slot.dato].push(slot);
        });
        for (const dato in grupper) {
            grupper[dato].sort((a, b) => a.startTid.localeCompare(b.startTid));
        }
        return Object.entries(grupper).sort(([a], [b]) => a.localeCompare(b));
    }, [forhandsvisning.ledige]);

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2">
            <h2 className="text-base font-semibold mb-1">
                Massebooking
            </h2>

            {loading ? (
                <div className="text-center py-10">
                    <Spinner />
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={håndterTabChange} className="mt-2">
                    <TabsList className="mb-3">
                        <TabsTrigger value="oppsett">Oppsett</TabsTrigger>
                        <TabsTrigger value="forhandsvisning" disabled={valgteBaner.length === 0}>
                            Forhåndsvisning ({forhandsvisning.ledige.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="oppsett">
                        <Card className="p-3 space-y-4 mb-4">

                            <section>
                                <Label htmlFor="bookingtype">Type booking</Label>
                                <select
                                    id="bookingtype"
                                    className="w-full border rounded text-sm px-3 py-2"
                                    value={bookingtype}
                                    onChange={e => setBookingtype(e.target.value)}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="kurs">Kurs</option>
                                    <option value="trening">Trening</option>
                                    <option value="turnering">Turnering</option>
                                </select>
                            </section>

                            <section>
                                <Label htmlFor="kommentar">Beskrivelse</Label>
                                <textarea
                                    id="kommentar"
                                    className="w-full border rounded text-sm px-3 py-2"
                                    rows={2}
                                    value={kommentar}
                                    onChange={e => setKommentar(e.target.value)}
                                />
                            </section>

                            <section>
                                <Label className="inline-flex items-center">
                                    <Checkbox checked={alleBaner} onCheckedChange={val => setAlleBaner(!!val)} />
                                    <span className="ml-2">Alle baner</span>
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {baner.map(b => (
                                        <label
                                            key={b.id}
                                            className={`cursor-pointer rounded border px-3 py-1 text-sm select-none ${valgteBaner.includes(b.id) ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={valgteBaner.includes(b.id)}
                                                onChange={() => toggle(b.id, setValgteBaner)}
                                                disabled={alleBaner}
                                                className="hidden"
                                            />
                                            {b.navn}
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Fra dato</Label>
                                    <DatoVelger value={datoFra} onChange={d => setDatoFra(d ?? null)} minDate={new Date()} />
                                </div>
                                <div>
                                    <Label>Til dato</Label>
                                    <DatoVelger value={datoTil} onChange={d => setDatoTil(d ?? null)} minDate={datoFra || new Date()} />
                                </div>
                            </section>

                            <section>
                                <Label className="inline-flex items-center">
                                    <Checkbox checked={alleUkedager} onCheckedChange={val => setAlleUkedager(!!val)} />
                                    <span className="ml-2">Alle gyldige dager</span>
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
                                            type="button"
                                        >
                                            {dag}
                                        </Button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <Label className="inline-flex items-center">
                                    <Checkbox checked={alleTidspunkter} onCheckedChange={val => setAlleTidspunkter(!!val)} />
                                    <span className="ml-2">Alle tidspunkter</span>
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tilgjengeligeTidspunkter.map(tid => (
                                        <label
                                            key={tid}
                                            className={`cursor-pointer rounded border px-3 py-1 text-sm select-none ${valgteTidspunkter.includes(tid) ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={valgteTidspunkter.includes(tid)}
                                                onChange={() => toggle(tid, setValgteTidspunkter)}
                                                disabled={alleTidspunkter}
                                                className="hidden"
                                            />
                                            {tid}
                                        </label>
                                    ))}
                                </div>
                            </section>
                        </Card>
                    </TabsContent>

                    <TabsContent value="forhandsvisning">
                        <Card className="p-3">
                            {forhandsvisning.ledige.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Ingen bookinger tilgjengelig.</p>
                            ) : (
                                <>
                                    {grupperteSlots.map(([dato, slots]) => (
                                        <section key={dato} className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-600 mb-1">{dato}</h3>
                                            <BookingSlotList
                                                slots={slots.map(slot => {
                                                    const tilhørendeBane = baner.find(b => b.id === slot.baneId);
                                                    return {
                                                        ...slot,
                                                        baneNavn: tilhørendeBane?.navn ?? '(ukjent bane)',
                                                        kanBookes: false,
                                                        kanAvbestille: false,
                                                        kanSlette: false,
                                                        erPassert: false,
                                                        booketAv: '',
                                                        værSymbol: undefined,
                                                        bookingtype,
                                                        kommentar,
                                                    };
                                                })}
                                                currentUser={{ epost: 'admin@system.no' }}
                                                modus="readonly"
                                                apenSlotTid={null}
                                                setApenSlotTid={() => { }}
                                            />
                                        </section>
                                    ))}
                                    <div className="flex justify-end mt-3">
                                        <Button type="button" onClick={håndterOpprett} disabled={loading}>
                                            Opprett {forhandsvisning.ledige.length} bookinger
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
