import { useParams } from 'react-router-dom';
import { useKlubb } from '../hooks/useKlubb.js';
import { Separator } from '@/components/ui/separator.js';
export default function ReglementPage() {
    const { slug } = useParams();
    const { klubb, laster } = useKlubb(slug);

    if (laster)
        return <p className="text-sm text-muted-foreground px-2 py-2">Laster reglement...</p>;
    if (!klubb)
        return <p className="text-sm text-destructive px-2 py-2">Reglement ikke tilgjengelig.</p>;

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2">
            <section className="mb-4">
                <h2 className="text-sm font-medium mb-1">Bookingregler</h2>
                <ul className="list-disc list-inside text-sm text-gray-800">
                    <li>Maks {klubb.bookingRegel.maksPerDag} bookinger per dag</li>
                    <li>Maks {klubb.bookingRegel.maksTotalt} aktive bookinger totalt</li>
                    <li>Du kan booke opptil {klubb.bookingRegel.dagerFremITid} dager frem i tid</li>
                    <li>Hver booking varer i {klubb.bookingRegel.slotLengdeMinutter} minutter</li>
                </ul>
            </section>

            <section>
                <h2 className="text-sm font-medium mb-1">Banereglement</h2>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {klubb.banereglement || 'Ingen spesifikt reglement oppgitt av klubben.'}
                </p>
            </section>
        </div>
    );
}
