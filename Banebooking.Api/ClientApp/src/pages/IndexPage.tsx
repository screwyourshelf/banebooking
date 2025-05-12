import { useEffect, useState } from 'react';
import { ListGroup, Nav, Button } from 'react-bootstrap';
import DatePicker, { registerLocale } from 'react-datepicker';
import { nb } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { InputGroup } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';


registerLocale('nb', nb);

type BookingSlot = {
    startTid: string;
    sluttTid: string;
    booketAv?: string | null;
};

type Bane = {
    id: string;
    navn: string;
};

export default function IndexPage() {
    const [baner, setBaner] = useState<Bane[]>([]);
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [slots, setSlots] = useState<BookingSlot[]>([]);

    useEffect(() => {
        fetch('/api/baner')
            .then((res) => res.json())
            .then((data) => {
                setBaner(data);
                if (data.length > 0 && !valgtBaneId) {
                    setValgtBaneId(data[0].id);
                }
            });
    }, []);

    useEffect(() => {
        if (!valgtBaneId || !valgtDato) return;

        fetch(`/api/bookinger?baneId=${valgtBaneId}&dato=${valgtDato}`)
            .then((res) => res.json())
            .then((data) => setSlots(data))
            .catch(() => setSlots([]));
    }, [valgtBaneId, valgtDato]);

    const gaTilNesteDag = () => {
        const neste = new Date(valgtDato);
        neste.setDate(neste.getDate() + 1);
        setValgtDato(neste.toISOString().split('T')[0]);
    };

    const gaTilForrigeDag = () => {
        const forrige = new Date(valgtDato);
        forrige.setDate(forrige.getDate() - 1);
        setValgtDato(forrige.toISOString().split('T')[0]);
    };

    return (
        <div className="w-100">
            {/* Banevalg som pills */}
            <Nav
                variant="pills"
                activeKey={valgtBaneId}
                onSelect={(baneId) => setValgtBaneId(baneId || '')}
                className="pt-1 overflow-auto flex-nowrap"
                style={{ whiteSpace: 'nowrap' }}
            >
                {baner.map((bane) => (
                    <Nav.Item key={bane.id}>
                        <Nav.Link eventKey={bane.id}>{bane.navn}</Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            {/* Bookingliste */}
            <div className="w-100 py-1">
                <ListGroup className="w-100">
                    {slots.map((slot, index) => (
                        <ListGroup.Item
                            key={index}
                            className={`w-100 py-1 px-1 m-0 ${index % 2 === 0 ? 'bg-light' : 'bg-white'
                                }`}
                        >
                            <div className="d-flex flex-nowrap align-items-start">
                                <div
                                    className="fw-semibold text-nowrap border-end pe-1"
                                >
                                    {slot.startTid.slice(0, 2)} - {slot.sluttTid.slice(0, 2)}
                                </div>
                                <div className="ps-2 text-break">{slot.booketAv ?? ''}</div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>

            {/* Fast datovelger nederst */}
            <div className="bg-light border-top px-3 py-2 position-fixed bottom-0 start-0 w-100">
                <InputGroup size="sm">
                  

                    <DatePicker
                        selected={new Date(valgtDato)}
                        onChange={(date) =>
                            setValgtDato(date?.toISOString().split('T')[0] ?? valgtDato)
                        }
                        locale="nb"
                        dateFormat="dd.MM.yyyy"
                        className="form-control form-control-sm"
                        popperPlacement="top-start"
                    />

                    <InputGroup.Text>
                        <FaCalendar />
                    </InputGroup.Text>

                    <Button variant="outline-secondary" className="border-secondary border-opacity-50 ms-1 me-1 " onClick={gaTilForrigeDag}>
                        <FaChevronLeft />
                    </Button>
                    <Button variant="outline-secondary" className="border-secondary border-opacity-50" onClick={gaTilNesteDag}>
                        <FaChevronRight />
                    </Button>
                </InputGroup>
            </div>
        </div>
    );
}
