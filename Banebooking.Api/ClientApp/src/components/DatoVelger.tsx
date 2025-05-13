import { InputGroup, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { nb } from 'date-fns/locale';
import { registerLocale } from 'react-datepicker';

registerLocale('nb', nb);

type Props = {
    valgtDato: string;
    onVelgDato: (nyDato: string) => void;
};

export default function DatoVelger({ valgtDato, onVelgDato }: Props) {
    const dato = new Date(valgtDato);

    const nesteDag = () => {
        const neste = new Date(dato);
        neste.setDate(neste.getDate() + 1);
        onVelgDato(neste.toISOString().split('T')[0]);
    };

    const forrigeDag = () => {
        const forrige = new Date(dato);
        forrige.setDate(forrige.getDate() - 1);
        onVelgDato(forrige.toISOString().split('T')[0]);
    };

    return (
        <div className="bg-white mt-1 w-100">
            <InputGroup size="sm">
                <DatePicker
                    selected={dato}
                    onChange={(date) =>
                        onVelgDato(date?.toISOString().split('T')[0] ?? valgtDato)
                    }
                    locale="nb"
                    dateFormat="dd.MM.yyyy"
                    className="form-control form-control-sm"
                    popperPlacement="top-start"
                />
                <InputGroup.Text>
                    <FaCalendar />
                </InputGroup.Text>
                <Button variant="outline-secondary" className="ms-1 me-1" onClick={forrigeDag}>
                    <FaChevronLeft />
                </Button>
                <Button variant="outline-secondary" onClick={nesteDag}>
                    <FaChevronRight />
                </Button>
            </InputGroup>
        </div>
    );
}
