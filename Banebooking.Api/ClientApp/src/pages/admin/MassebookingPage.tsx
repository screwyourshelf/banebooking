import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Tabs, Tab, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ukedager, dagNavnTilEnum } from '../../utils/datoUtils';
import { useMassebooking } from '../../hooks/useMassebooking';
import type { MassebookingDto } from '../../types';
import { BookingSlotList } from '../../components/Booking/BookingSlotList';

export default function MassebookingPage() {
    const { slug } = useParams<{ slug: string }>();
    const {
        klubb,
        baner,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        setForhandsvisning, // ← legg til denne
        forhandsvis,
        opprett,
        loading
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

    const nullstillForhandsvisning = () =>
        setForhandsvisning({ ledige: [], konflikter: [] });

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
        set(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
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
            kommentar
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

    const håndterTabChange = async (k: string | null) => {
        const valgt = k ?? 'oppsett';
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
        <div className="p-3">
            <h4>Massebooking {klubb?.navn && <span className="text-muted">– {klubb.navn}</span>}</h4>

            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Tabs activeKey={activeTab} onSelect={håndterTabChange} className="mb-3">
                    <Tab eventKey="oppsett" title="Oppsett">
                        <Card className="p-3 mb-4">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type booking</Form.Label>
                                    <Form.Select value={bookingtype} onChange={e => setBookingtype(e.target.value)}>
                                        <option value="admin">Administrator</option>
                                        <option value="kurs">Kurs</option>
                                        <option value="trening">Trening</option>
                                        <option value="turnering">Turnering</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Beskrivelse</Form.Label>
                                    <Form.Control as="textarea" rows={2} value={kommentar} onChange={e => setKommentar(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Velg baner</Form.Label>
                                    <Form.Check type="checkbox" label="Alle baner" checked={alleBaner} onChange={e => setAlleBaner(e.target.checked)} />
                                    <div className="d-flex gap-2 flex-wrap mt-2">
                                        {baner.map(b => (
                                            <Form.Check
                                                key={b.id}
                                                type="checkbox"
                                                label={b.navn}
                                                checked={valgteBaner.includes(b.id)}
                                                onChange={() => toggle(b.id, setValgteBaner)}
                                                disabled={alleBaner}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>

                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fra dato</Form.Label>
                                            <DatePicker selected={datoFra} onChange={setDatoFra} minDate={new Date()} dateFormat="yyyy-MM-dd" className="form-control" />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Til dato</Form.Label>
                                            <DatePicker selected={datoTil} onChange={setDatoTil} minDate={datoFra || new Date()} dateFormat="yyyy-MM-dd" className="form-control" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ukedager</Form.Label>
                                    <Form.Check type="checkbox" label="Alle gyldige dager" checked={alleUkedager} onChange={e => setAlleUkedager(e.target.checked)} />
                                    <div className="d-flex gap-2 flex-wrap mt-2">
                                        {ukedager.map(dag => (
                                            <Button
                                                key={dag}
                                                variant={valgteUkedager.includes(dag) ? 'primary' : 'outline-secondary'}
                                                size="sm"
                                                onClick={(e) => {
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
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Klokkeslett</Form.Label>
                                    <Form.Check type="checkbox" label="Alle tidspunkter" checked={alleTidspunkter} onChange={e => setAlleTidspunkter(e.target.checked)} />
                                    <div className="d-flex gap-2 flex-wrap mt-2">
                                        {tilgjengeligeTidspunkter.map(tid => (
                                            <Form.Check
                                                key={tid}
                                                type="checkbox"
                                                label={tid}
                                                checked={valgteTidspunkter.includes(tid)}
                                                onChange={() => toggle(tid, setValgteTidspunkter)}
                                                disabled={alleTidspunkter}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                            </Form>
                        </Card>
                    </Tab>

                    <Tab eventKey="forhandsvisning" title={`Forhåndsvisning (${forhandsvisning.ledige.length})`} disabled={valgteBaner.length === 0}>
                        <Card className="p-3">
                            {forhandsvisning.ledige.length === 0 ? (
                                <div className="text-muted">Ingen bookinger tilgjengelig. Endre oppsettet og prøv igjen.</div>
                            ) : (
                                <>
                                    {grupperteSlots.map(([dato, slots]) => (
                                        <div key={dato} className="mb-3">
                                            <h6 className="text-muted">{dato}</h6>
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
                                                        kommentar
                                                    };
                                                })}
                                                currentUser={{ epost: 'admin@system.no' }}
                                                modus="readonly"
                                                apenSlotTid={null}
                                                setApenSlotTid={() => { }}
                                            />
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-end mt-3">
                                        <Button type="button" variant="success" onClick={håndterOpprett} disabled={loading}>
                                            Opprett {forhandsvisning.ledige.length} bookinger
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </Tab>
                </Tabs>
            )}
        </div>
    );
}
