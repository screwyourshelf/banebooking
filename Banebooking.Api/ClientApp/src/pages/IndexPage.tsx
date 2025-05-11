import { useEffect, useState } from 'react';
import { Form, ListGroup, InputGroup } from 'react-bootstrap';
import DatePicker, { registerLocale } from 'react-datepicker';
import { nb } from 'date-fns/locale';
import { FaCalendar } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('nb', nb);

const mockBaner = [
    { id: '1', navn: 'Bane 1' },
    { id: '2', navn: 'Bane 2' }
];

function genererMockSlots() {
    const brukere = ['ola.langemailadresse@bruker.no', 'kari@kort.no', 'noeheltvanvittiglangt@eksempel.no'];
    const slots = [];
    for (let hour = 7; hour < 22; hour++) {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const slutt = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const booketAv = Math.random() < 0.4 ? brukere[Math.floor(Math.random() * brukere.length)] : null;
        slots.push({ startTid: start, sluttTid: slutt, booketAv });
    }
    return slots;
}

export default function IndexPage() {
    const [valgtBaneId, setValgtBaneId] = useState<string>('1');
    const [valgtDato, setValgtDato] = useState<string>(() =>
        new Date().toISOString().split('T')[0]
    );
    const [slots, setSlots] = useState(genererMockSlots());

    useEffect(() => {
        setSlots(genererMockSlots());
    }, [valgtBaneId, valgtDato]);

    return (
        <div className="w-100">
            <div className="bg-light w-100 px-2 py-2 mt-2 mb-2">
                <div className="row gx-2">
                    <div className="col-auto">
                        <Form.Select
                            value={valgtBaneId}
                            onChange={(e) => setValgtBaneId(e.target.value)}
                            className="form-select form-select-sm"
                        >
                            {mockBaner.map((bane) => (
                                <option key={bane.id} value={bane.id}>
                                    {bane.navn}
                                </option>
                            ))}
                        </Form.Select>
                    </div>

                    <div className="col-auto">
                        <InputGroup size="sm">
                            <DatePicker
                                selected={new Date(valgtDato)}
                                onChange={(date) => setValgtDato(date?.toISOString().split('T')[0] || valgtDato)}
                                locale="nb"
                                dateFormat="dd.MM.yyyy"
                                className="form-control"
                            />
                            <InputGroup.Text><FaCalendar /></InputGroup.Text>
                        </InputGroup>
                    </div>
                </div>
            </div>

            <ListGroup className="w-100 m-0">
                {slots.map((slot, index) => (
                    <ListGroup.Item
                        key={index}
                        className={`w-100 py-1 px-2 m-0 ${index % 2 === 0 ? 'bg-light' : 'bg-white'}`}
                    >
                        <div className="d-flex flex-nowrap align-items-start">
                            <div className="fw-semibold text-nowrap border-end pe-2" style={{ minWidth: '60px' }}>
                                {slot.startTid.slice(0, 2)} - {slot.sluttTid.slice(0, 2)}
                            </div>
                            <div className="ps-2 text-break">
                                {slot.booketAv ?? ''}
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
}
