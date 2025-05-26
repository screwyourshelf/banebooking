import { useEffect, useMemo, useState } from 'react';
import { Form, Button, Card, Row, Col, Table, Tabs, Tab } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ukedager = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

type Forhandsbooking = {
    dato: string;
    klokkeslett: string;
    bane: string;
};

function getUkenavnFraDato(d: Date): string {
    return ukedager[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function finnUkedagerIMellom(start: Date, slutt: Date): string[] {
    const dager = new Set<string>();
    const cursor = new Date(start);
    while (cursor <= slutt) {
        const navn = getUkenavnFraDato(cursor);
        dager.add(navn);
        cursor.setDate(cursor.getDate() + 1);
    }
    return Array.from(dager);
}

export default function MassebookingPage() {
    const tilgjengeligeBaner = useMemo(() => ['Bane 1', 'Bane 2', 'Bane 3'], []);
    const tilgjengeligeTidspunkter = useMemo(() => ['08:00', '09:00', '10:00', '18:00', '19:00', '20:00'], []);

    const [valgteBaner, setValgteBaner] = useState<string[]>([]);
    const [valgteUkedager, setValgteUkedager] = useState<string[]>([]);
    const [valgteTidspunkter, setValgteTidspunkter] = useState<string[]>([]);
    const [datoFra, setDatoFra] = useState<Date | null>(new Date());
    const [datoTil, setDatoTil] = useState<Date | null>(new Date());

    const [alleBaner, setAlleBaner] = useState(false);
    const [alleUkedager, setAlleUkedager] = useState(false);
    const [alleTidspunkter, setAlleTidspunkter] = useState(false);

    const [bookingtype, setBookingtype] = useState("admin");
    const [beskrivelse, setBeskrivelse] = useState("");

    const [forhandsvisning, setForhandsvisning] = useState<Forhandsbooking[]>([]);

    const tilgjengeligeUkedager = useMemo(() => {
        if (!datoFra || !datoTil) return ukedager;
        return finnUkedagerIMellom(datoFra, datoTil);
    }, [datoFra, datoTil]);

    useEffect(() => {
        setValgteBaner(alleBaner ? tilgjengeligeBaner : []);
    }, [alleBaner, tilgjengeligeBaner]);

    useEffect(() => {
        setValgteTidspunkter(alleTidspunkter ? tilgjengeligeTidspunkter : []);
    }, [alleTidspunkter, tilgjengeligeTidspunkter]);

    useEffect(() => {
        setValgteUkedager(alleUkedager ? tilgjengeligeUkedager : []);
    }, [alleUkedager, tilgjengeligeUkedager]);

    function toggle(item: string, set: React.Dispatch<React.SetStateAction<string[]>>) {
        set(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }

    function genererBookinger(): Forhandsbooking[] {
        if (!datoFra || !datoTil || valgteBaner.length === 0 || valgteUkedager.length === 0 || valgteTidspunkter.length === 0)
            return [];

        const result: Forhandsbooking[] = [];
        const cursor = new Date(datoFra);

        while (cursor <= datoTil) {
            const dagNavn = getUkenavnFraDato(cursor);
            if (valgteUkedager.includes(dagNavn)) {
                valgteBaner.forEach(bane => {
                    valgteTidspunkter.forEach(tid => {
                        result.push({
                            dato: cursor.toISOString().split('T')[0],
                            klokkeslett: tid,
                            bane
                        });
                    });
                });
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        return result;
    }

    useEffect(() => {
        setForhandsvisning(genererBookinger());
    }, [datoFra, datoTil, valgteBaner, valgteUkedager, valgteTidspunkter, bookingtype, beskrivelse]);

    return (
        <div className="p-3">
            <h4>Massebooking</h4>

            <Tabs defaultActiveKey="oppsett" className="mb-3">
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

                            <Form.Group className="mb-4">
                                <Form.Label>Beskrivelse</Form.Label>
                                <Form.Control as="textarea" rows={2} value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Velg baner</Form.Label>
                                <Form.Check type="checkbox" label="Alle baner" checked={alleBaner} onChange={e => setAlleBaner(e.target.checked)} />
                                <div className="d-flex gap-2 flex-wrap mt-2">
                                    {tilgjengeligeBaner.map(b => (
                                        <Form.Check
                                            key={b}
                                            type="checkbox"
                                            label={b}
                                            checked={valgteBaner.includes(b)}
                                            onChange={() => toggle(b, setValgteBaner)}
                                            disabled={alleBaner}
                                        />
                                    ))}
                                </div>
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fra dato</Form.Label>
                                        <DatePicker
                                            selected={datoFra}
                                            onChange={setDatoFra}
                                            minDate={new Date()}
                                            dateFormat="yyyy-MM-dd"
                                            className="form-control"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Til dato</Form.Label>
                                        <DatePicker
                                            selected={datoTil}
                                            onChange={setDatoTil}
                                            minDate={datoFra || new Date()}
                                            dateFormat="yyyy-MM-dd"
                                            className="form-control"
                                        />
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

                           

                            <Button variant="success" disabled>
                                Opprett bookinger (ikke implementert)
                            </Button>
                        </Form>
                    </Card>
                </Tab>

                <Tab eventKey="forhandsvisning" title="Forhåndsvisning" disabled={forhandsvisning.length === 0}>
                    <Card className="p-3">
                        <h6 className="mb-2">
                            <strong>Type:</strong> {bookingtype} <br />
                            <strong>Beskrivelse:</strong> {beskrivelse || '(ingen)'}
                        </h6>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Dato</th>
                                    <th>Klokkeslett</th>
                                    <th>Bane</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forhandsvisning.map((b, i) => (
                                    <tr key={i}>
                                        <td>{b.dato}</td>
                                        <td>{b.klokkeslett}</td>
                                        <td>{b.bane}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}
