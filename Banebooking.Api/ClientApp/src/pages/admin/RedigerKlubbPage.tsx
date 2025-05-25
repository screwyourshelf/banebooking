import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useKlubb } from '../../hooks/useKlubb';
import { oppdaterKlubb } from '../../api/klubb';
import { toast } from 'react-toastify';

export default function RedigerKlubbPage() {
    const { slug } = useParams<{ slug: string }>();
    const { klubb, laster } = useKlubb(slug);
    const [form, setForm] = useState({
        navn: '',
        kontaktEpost: '',
        banereglement: '',
        latitude: '',
        longitude: '',
        bookingRegel: {
            maksPerDag: 1,
            maksTotalt: 2,
            dagerFremITid: 7,
            slotLengdeMinutter: 60,
        }
    });
    const [lagrer, setLagrer] = useState(false);

    useEffect(() => {
        if (klubb) {
            setForm({
                navn: klubb.navn,
                kontaktEpost: klubb.kontaktEpost ?? '',
                banereglement: klubb.banereglement ?? '',
                latitude: klubb.latitude?.toString() ?? '',
                longitude: klubb.longitude?.toString() ?? '',
                bookingRegel: {
                    maksPerDag: klubb.bookingRegel?.maksPerDag ?? 1,
                    maksTotalt: klubb.bookingRegel?.maksTotalt ?? 2,
                    dagerFremITid: klubb.bookingRegel?.dagerFremITid ?? 7,
                    slotLengdeMinutter: klubb.bookingRegel?.slotLengdeMinutter ?? 60,
                }
            });
        }
    }, [klubb]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLagrer(true);

        // Ta snapshot av form-verdiene før async starter
        const verdier = { ...form };

        try {
            await oppdaterKlubb(slug!, {
                navn: verdier.navn,
                kontaktEpost: verdier.kontaktEpost,
                banereglement: verdier.banereglement,
                latitude: parseFloat(verdier.latitude),
                longitude: parseFloat(verdier.longitude),
                bookingRegel: { ...verdier.bookingRegel }
            });
            toast.success('Endringer lagret');
        } catch (error: unknown) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error('Ukjent feil');
        }

        setLagrer(false);
    }


    if (laster) return <Spinner animation="border" />;
    if (!klubb) return <div>Fant ikke klubb.</div>;

    return (
        <div className="p-3">
            <h4>Rediger klubb</h4>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                    <Form.Label>Navn</Form.Label>
                    <Form.Control
                        value={form.navn}
                        onChange={e => setForm(f => ({ ...f, navn: e.target.value }))}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Kontakt-e-post</Form.Label>
                    <Form.Control
                        value={form.kontaktEpost}
                        onChange={e => setForm(f => ({ ...f, kontaktEpost: e.target.value }))}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Banereglement</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={form.banereglement}
                        onChange={e => setForm(f => ({ ...f, banereglement: e.target.value }))}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control
                        value={form.latitude}
                        onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                        value={form.longitude}
                        onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                    />
                </Form.Group>

                <h5 className="mt-3">Bookingregler</h5>

                <Form.Group className="mb-3">
                    <Form.Label>Maks bookinger per dag: {form.bookingRegel.maksPerDag}</Form.Label>
                    <Form.Range
                        min={0}
                        max={5}
                        step={1}
                        value={form.bookingRegel.maksPerDag}
                        onChange={e =>
                            setForm(f => ({
                                ...f,
                                bookingRegel: { ...f.bookingRegel, maksPerDag: parseInt(e.target.value) }
                            }))
                        }
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Maks antall aktive bookinger totalt: {form.bookingRegel.maksTotalt}</Form.Label>
                    <Form.Range
                        min={0}
                        max={10}
                        step={1}
                        value={form.bookingRegel.maksTotalt}
                        onChange={e =>
                            setForm(f => ({
                                ...f,
                                bookingRegel: { ...f.bookingRegel, maksTotalt: parseInt(e.target.value) }
                            }))
                        }
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Dager frem i tid tillatt: {form.bookingRegel.dagerFremITid}</Form.Label>
                    <Form.Range
                        min={1}
                        max={14}
                        step={1}
                        value={form.bookingRegel.dagerFremITid}
                        onChange={e =>
                            setForm(f => ({
                                ...f,
                                bookingRegel: { ...f.bookingRegel, dagerFremITid: parseInt(e.target.value) }
                            }))
                        }
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label>Slot-lengde (minutter)</Form.Label>
                    <Form.Select
                        value={form.bookingRegel.slotLengdeMinutter}
                        onChange={e =>
                            setForm(f => ({
                                ...f,
                                bookingRegel: {
                                    ...f.bookingRegel,
                                    slotLengdeMinutter: parseInt(e.target.value)
                                }
                            }))
                        }
                    >
                        <option value={30}>30 minutter</option>
                        <option value={45}>45 minutter</option>
                        <option value={60}>60 minutter</option>
                        <option value={90}>90 minutter</option>
                    </Form.Select>
                </Form.Group>

                <Button type="submit" disabled={lagrer}>
                    {lagrer ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
            </Form>
        </div>
    );
}
