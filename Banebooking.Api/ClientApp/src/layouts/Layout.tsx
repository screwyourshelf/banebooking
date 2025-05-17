import React, { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import {
    Nav,
    Navbar,
    NavDropdown,
    Form,
    Button,
    Spinner
} from 'react-bootstrap';
import { supabase } from '../supabase';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import type { User } from '@supabase/supabase-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const slugFromUrl = window.location.pathname.split('/')[1];
    const redirectTo = window.location.origin + (slugFromUrl ? `/${slugFromUrl}` : '/');

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
            toast.error(error.message);
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
            toast.error(error.message);
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
        if (error) {
            toast.error('E-postlogin-feil: ' + error.message);
        } else {
            toast.success('Lenke sendt – sjekk innboksen!');
        }
    };

    return (
        <SlugContext.Provider value={slug}>
            <Navbar bg="light" expand="sm" className="border-bottom w-100 p-1 m-0">
                <div className="w-100 d-flex justify-content-between align-items-center px-0">
                    <Navbar.Brand href="/" className="fw-bold py-0 px-2 m-0 d-flex align-items-center gap-2">
                        <img
                            src={`/klubber/${slug}/img/logo.webp`}
                            onError={(e) => (e.currentTarget.src = '/klubblogoer/default.webp')}
                            alt="Klubblogo"
                            width="32"
                            height="32"
                            className="d-inline-block align-top"
                        />
                        Ã…s Tennisklubb
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
                                        toast.info('Du er logget ut.');
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

            <ToastContainer position="bottom-center" autoClose={3000} />
        </SlugContext.Provider>
    );
}
