import { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useBaner } from '../../hooks/useBaner';
import { toast } from 'react-toastify';

export default function RedigerBanerPage() {
    const { baner, loading, oppdaterBane, opprettBane, deaktiverBane, aktiverBane } = useBaner(true);
    const [redigerte, setRedigerte] = useState<Record<string, { navn: string; beskrivelse: string }>>({});
    const [nyBane, setNyBane] = useState({ navn: '', beskrivelse: '' });
    const [valgtBaneId, setValgtBaneId] = useState<string | null>(null);

    function håndterEndring(id: string, felt: 'navn' | 'beskrivelse', verdi: string) {
        setRedigerte((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? baner.find(b => b.id === id)!),
                [felt]: verdi
            }
        }));
    }

    async function lagre(id: string) {
        const oppdatert = redigerte[id];
        if (!oppdatert) return;

        try {
            await oppdaterBane(id, oppdatert);
            toast.success('Endringer lagret');
            setRedigerte((prev) => {
                const ny = { ...prev };
                delete ny[id];
                return ny;
            });
        } catch {
            toast.error('Kunne ikke lagre bane');
        }
    }

    async function leggTil() {
        if (!nyBane.navn.trim()) {
            toast.error('Navn er påkrevd');
            return;
        }

        try {
            await opprettBane(nyBane);
            toast.success('Bane lagt til');
            setNyBane({ navn: '', beskrivelse: '' });
        } catch {
            toast.error('Kunne ikke legge til bane');
        }
    }

    async function deaktiver(id: string) {
        try {
            await deaktiverBane(id);
            toast.success('Bane deaktivert');
            setValgtBaneId(null);
        } catch {
            toast.error('Kunne ikke deaktivere bane');
        }
    }

    async function aktiver(id: string) {
        try {
            await aktiverBane(id);
            toast.success('Bane aktivert');
            setValgtBaneId(null);
        } catch {
            toast.error('Kunne ikke aktivere bane');
        }
    }

    const valgtBane = baner.find(b => b.id === valgtBaneId);
    const redigerteVerdier = valgtBaneId && redigerte[valgtBaneId];

    return (
        <div className="p-3">
            <h4>Administrer baner</h4>

            {loading && <Spinner animation="border" />}

            {!loading && (
                <Form.Group className="mb-3">
                    <Form.Label>Velg bane</Form.Label>
                    <Form.Select
                        value={valgtBaneId ?? ''}
                        onChange={(e) => setValgtBaneId(e.target.value || null)}
                    >
                        <option value="">— Velg bane —</option>
                        {baner.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.navn} {b.aktiv ? '' : '(inaktiv)'} – {b.beskrivelse}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {valgtBane && (
                <Form className={`border rounded p-3 mb-3 ${!valgtBane.aktiv ? 'bg-light text-muted' : ''}`}>
                    <Form.Group className="mb-2">
                        <Form.Label>Navn</Form.Label>
                        <Form.Control
                            type="text"
                            value={redigerteVerdier?.navn ?? valgtBane.navn}
                            onChange={(e) => håndterEndring(valgtBane.id, 'navn', e.target.value)}
                            disabled={!valgtBane.aktiv}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Beskrivelse</Form.Label>
                        <Form.Control
                            type="text"
                            value={redigerteVerdier?.beskrivelse ?? valgtBane.beskrivelse}
                            onChange={(e) => håndterEndring(valgtBane.id, 'beskrivelse', e.target.value)}
                            disabled={!valgtBane.aktiv}
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-between">
                        {valgtBane.aktiv ? (
                            <>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => lagre(valgtBane.id)}
                                    disabled={
                                        !redigerteVerdier ||
                                        (redigerteVerdier.navn === valgtBane.navn &&
                                            redigerteVerdier.beskrivelse === valgtBane.beskrivelse)
                                    }
                                >
                                    Lagre
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => deaktiver(valgtBane.id)}>
                                    Deaktiver
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline-primary" size="sm" onClick={() => aktiver(valgtBane.id)}>
                                Aktiver
                            </Button>
                        )}
                    </div>
                </Form>
            )}

            <hr />
            <h5>Ny bane</h5>
            <Form className="border rounded p-2">
                <Form.Group className="mb-2">
                    <Form.Label>Navn</Form.Label>
                    <Form.Control
                        type="text"
                        value={nyBane.navn}
                        onChange={(e) => setNyBane((f) => ({ ...f, navn: e.target.value }))}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Beskrivelse</Form.Label>
                    <Form.Control
                        type="text"
                        value={nyBane.beskrivelse}
                        onChange={(e) => setNyBane((f) => ({ ...f, beskrivelse: e.target.value }))}
                    />
                </Form.Group>

                <Button onClick={leggTil}>Legg til</Button>
            </Form>
        </div>
    );
}
