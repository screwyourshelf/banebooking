import { useParams } from 'react-router-dom';
import { useBruker } from '../hooks/useBruker';
import type { BookingSlot } from '../types';

export default function MinSide() {
    const { slug } = useParams();
    const { bruker, laster, error } = useBruker(slug);

    if (error) return <div className="alert alert-danger">Feil: {error}</div>;
    if (laster || !bruker) return <div>Laster brukerdata ...</div>;

    return (
        <div className="container mt-3">
            <h3>Min side</h3>
            <p>Innlogget som: <strong>{bruker.epost}</strong></p>

            <h5 className="mt-4">Mine bookinger</h5>
            {bruker.bookinger.length === 0 ? (
                <p>Du har ingen bookinger ennå.</p>
            ) : (
                <table className="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Bane</th>
                            <th>Start</th>
                            <th>Slutt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bruker.bookinger.map((b: BookingSlot, index: number) => (
                            <tr key={index}>
                                <td>{b.baneNavn ?? '(ukjent bane)'}</td>
                                <td>{b.startTid}</td>
                                <td>{b.sluttTid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
