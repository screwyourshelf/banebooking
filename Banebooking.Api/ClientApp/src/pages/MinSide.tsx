import { useEffect, useState } from 'react';

type BookingDto = {
    id: string;
    startTid: string;
    sluttTid: string;
    baneNavn: string;
};

type BrukerDto = {
    id: string;
    epost: string;
    bookinger: BookingDto[];
};

export default function MinSide() {
    const [bruker, setBruker] = useState<BrukerDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/bruker/meg')
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then(setBruker)
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <div className="alert alert-danger">Feil: {error}</div>;
    if (!bruker) return <div>Laster brukerdata ...</div>;

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
                        {bruker.bookinger.map((b) => (
                            <tr key={b.id}>
                                <td>{b.baneNavn}</td>
                                <td>{formatTid(b.startTid)}</td>
                                <td>{formatTid(b.sluttTid)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function formatTid(iso: string): string {
    const dt = new Date(iso);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
