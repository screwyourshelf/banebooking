import { useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BookingSlotList } from '../components/Booking/BookingSlotList.js';
import { useMineBookinger } from '../hooks/useMineBookinger.js';
import { useCurrentUser } from '../hooks/useCurrentUser.js';
import { SlugContext } from '../layouts/Layout.js';
import Spinner from '@/components/ui/spinner.js';
import { Separator } from '@/components/ui/separator.js';
import { Card, CardContent } from '@/components/ui/card.js';

export default function MinSidePage() {
    const { slug: slugFraParams } = useParams<{ slug: string }>();
    const slug = useContext(SlugContext) ?? slugFraParams;

    const currentUser = useCurrentUser();
    const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);
    const { bookinger, laster, onCancel } = useMineBookinger(slug ?? '');

    const grupperteBookinger = useMemo(() => {
        const grupper: Record<string, typeof bookinger> = {};

        for (const slot of bookinger) {
            if (!grupper[slot.dato]) {
                grupper[slot.dato] = [];
            }
            grupper[slot.dato].push(slot);
        }

        for (const dato in grupper) {
            grupper[dato].sort((a, b) => a.startTid.localeCompare(b.startTid));
        }

        return Object.entries(grupper).sort(([datoA], [datoB]) => datoA.localeCompare(datoB));
    }, [bookinger]);

    if (laster)
        return (
            <div className="flex justify-center py-4">
                <Spinner />
            </div>
        );

    return (
        <div className="max-w-screen-sm mx-auto px-1 py-1">
            <h2 className="text-base font-semibold mb-2">Mine kommende bookinger</h2>

            {grupperteBookinger.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Ingen aktive bookinger funnet.</p>
            )}

            {grupperteBookinger.map(([dato, slots], index) => (
                <section key={dato} className="mb-4">

                    <Card>
                        <CardContent className="p-1 pt-0">
                            <h3 className="text-sm font-medium mb-1">{dato}</h3>

                            <BookingSlotList
                                slots={slots}
                                currentUser={currentUser ? { epost: currentUser.email ?? '' } : null}
                                modus="minside"
                                onCancel={onCancel}
                                apenSlotTid={apenSlotTid}
                                setApenSlotTid={setApenSlotTid}
                            />
                        </CardContent>

                    </Card>

                    {index !== grupperteBookinger.length - 1 && <Separator className="my-4" />}
                </section>
            ))}
        </div>
    );
}
