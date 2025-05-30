import { useParams } from 'react-router-dom';
import { useKlubb } from '../hooks/useKlubb.js';
import { Separator } from '@/components/ui/separator.js';
import { Card, CardContent } from '@/components/ui/card.js';

export default function ReglementPage() {
    const { slug } = useParams();
    const { klubb, laster } = useKlubb(slug);

    if (laster)
        return <p className="text-sm text-muted-foreground px-2 py-2">Laster reglement...</p>;
    if (!klubb)
        return <p className="text-sm text-destructive px-2 py-2">Reglement ikke tilgjengelig.</p>;

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2">
            <h2 className="text-base font-semibold mb-2">Regler for {klubb.navn}</h2>

            <Card>
                <CardContent className="p-4">
                    <section className="mb-4">
                        <h3 className="text-sm font-medium mb-1">Bookingregler</h3>
                        <ul className="list-disc list-inside text-sm text-gray-800">
                            <li>Maks {klubb.bookingRegel.maksPerDag} bookinger per dag</li>
                            <li>Maks {klubb.bookingRegel.maksTotalt} aktive bookinger totalt</li>
                            <li>Du kan booke opptil {klubb.bookingRegel.dagerFremITid} dager frem i tid</li>
                            <li>Hver booking varer i {klubb.bookingRegel.slotLengdeMinutter} minutter</li>
                        </ul>
                    </section>

                    <Separator className="my-4" />

                    <section>
                        <h3 className="text-sm font-medium mb-1">Banereglement</h3>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {klubb.banereglement || 'Ingen spesifikt reglement oppgitt av klubben.'}
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
