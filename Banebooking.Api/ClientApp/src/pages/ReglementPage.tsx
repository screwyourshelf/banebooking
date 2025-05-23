import { useParams } from 'react-router-dom';
import { useKlubb } from '../hooks/useKlubb';

export default function ReglementPage() {
    const { slug } = useParams();
    const { klubb, laster } = useKlubb(slug);

    if (laster) return <p>Laster reglement...</p>;
    if (!klubb) return <p>Reglement ikke tilgjengelig.</p>;

    return (
        <div className="container mt-4">
            <h2>Regler for {klubb.navn}</h2>

            <h5 className="mt-4">Bookingregler</h5>
            <ul>
                <li>Maks {klubb.bookingRegel.maksPerDag} bookinger per dag</li>
                <li>Maks {klubb.bookingRegel.maksTotalt} aktive bookinger totalt</li>
                <li>Du kan booke opptil {klubb.bookingRegel.dagerFremITid} dager frem i tid</li>
                <li>Hver booking varer i {klubb.bookingRegel.slotLengdeMinutter} minutter</li>
            </ul>

            <h5 className="mt-4">Banereglement</h5>
            <p style={{ whiteSpace: 'pre-wrap' }}>
                {klubb.banereglement || 'Ingen spesifikt reglement oppgitt av klubben.'}
            </p>
        </div>
    );
}
