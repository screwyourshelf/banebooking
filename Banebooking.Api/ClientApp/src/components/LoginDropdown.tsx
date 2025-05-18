import { useState } from 'react';
import {
    NavDropdown,
    Nav,
    Form,
    Button,
    Spinner
} from 'react-bootstrap';
import { supabase } from '../supabase';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import type { User } from '@supabase/supabase-js';

type Props = {
    currentUser: User | null;
    setCurrentUser: (u: User | null) => void;
    redirectTo: string;
};

export default function LoginDropdown({ currentUser, setCurrentUser, redirectTo }: Props) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo }
        });
        if (error) toast.error(error.message);
    };

    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo }
        });
        if (error) toast.error(error.message);
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        toast.info('Du er logget ut.');
    };

    if (!currentUser) {
        return (
            <NavDropdown
                title={<><FaSignInAlt className="me-2" />Logg inn</>}
                align="end"
                id="login-dropdown"
            >
                <div className="px-2 py-1">
                    <Nav.Item>
                        <Nav.Link onClick={handleGoogleLogin} className="d-flex align-items-center px-2 py-1">
                            <FcGoogle size={18} className="me-2" />
                            Logg inn med Google
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link onClick={handleFacebookLogin} className="d-flex align-items-center px-2 py-1">
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
        );
    }

    return (
        <NavDropdown title={currentUser.email} align="end" id="user-dropdown">
            <NavDropdown.Item href="/minside">
                <FaUser className="me-2" />
                Min side
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logg ut
            </NavDropdown.Item>
        </NavDropdown>
    );
}
