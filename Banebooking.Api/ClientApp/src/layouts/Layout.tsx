import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    Nav,
    Navbar,
    NavDropdown,
    Form,
    Button,
    Alert,
    Spinner
} from 'react-bootstrap';
import { supabase } from '../supabase';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import type { User } from '@supabase/supabase-js';

export default function Layout() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const redirectTo = window.location.origin + '/';

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                flow: 'redirect',
            } as unknown as Parameters<typeof supabase.auth.signInWithOAuth>[0]['options'],
        });
        if (error) {
            console.error(error.message);
        }
    };

    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo,
                flow: 'redirect',
            } as unknown as Parameters<typeof supabase.auth.signInWithOAuth>[0]['options'],
        });
        if (error) {
            console.error(error.message);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo }
        });
        setStatus(error ? 'error' : 'sent');
        if (error) console.error('E-postlogin-feil:', error.message);
    };

    return (
        <>
            <Navbar bg="light" expand="sm" className="border-bottom w-100 p-1 m-0">
                <div className="w-100 d-flex justify-content-between align-items-center px-0">
                    <Navbar.Brand href="/" className="fw-bold py-0 px-2 m-0">
                        Banebooking
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="nav-collapse" className="me-2" />
                </div>
                <Navbar.Collapse id="nav-collapse">
                    <Nav className="ms-auto px-1 py-0">
                        {!currentUser ? (
                            <NavDropdown
                                title={
                                    <>
                                        <FaSignInAlt className="me-2" />
                                        Logg inn
                                    </>
                                }
                                align="end"
                                id="login-dropdown"
                            >
                                <div className="px-2 py-1">
                                    <Nav.Item>
                                        <Nav.Link
                                            onClick={handleGoogleLogin}
                                            className="d-flex align-items-center px-2 py-1"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FcGoogle size={18} className="me-2" />
                                            Logg inn med Google
                                        </Nav.Link>
                                    </Nav.Item>

                                    <Nav.Item>
                                        <Nav.Link
                                            onClick={handleFacebookLogin}
                                            className="d-flex align-items-center px-2 py-1"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FaFacebook size={18} className="me-2" />
                                            Logg inn med Facebook
                                        </Nav.Link>
                                    </Nav.Item>
                                </div>

                                <hr className="my-2" />

                                <Form onSubmit={handleMagicLink} className="px-2">
                                    <Form.Group>
                                        <Form.Label className="small">Logg inn med E-post</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="email"
                                            placeholder="din@epost.no"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="success"
                                        size="sm"
                                        className="w-100 mt-2"
                                        disabled={status === 'sending'}
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Sender...
                                            </>
                                        ) : (
                                            'Send lenke'
                                        )}
                                    </Button>
                                </Form>

                                {status === 'sent' && (
                                    <Alert variant="success" className="mt-2 p-2 small mx-2">
                                        Sjekk innboksen for innloggingslenke.
                                    </Alert>
                                )}

                                {status === 'error' && (
                                    <Alert variant="danger" className="mt-2 p-2 small mx-2">
                                        Noe gikk galt – prøv igjen.
                                    </Alert>
                                )}
                            </NavDropdown>
                        ) : (
                            <NavDropdown title={currentUser.email} align="end" id="user-dropdown">
                                <NavDropdown.Item href="/minside">
                                    <FaUser className="me-2" />
                                    Min side
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item
                                    onClick={async () => {
                                        await supabase.auth.signOut();
                                        setCurrentUser(null);
                                    }}
                                >
                                    <FaSignOutAlt className="me-2" />
                                    Logg ut
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <main className="w-100 px-2">
                <Outlet />
            </main>
        </>
    );
}
