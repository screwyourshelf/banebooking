import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams, Outlet, Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Form, Button, Spinner } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavbarBrandMedKlubb from '../components/NavbarBrandMedKlubb';
import {
    FaUser, FaFacebook, FaSignInAlt, FaSignOutAlt, FaCalendarAlt,
    FaUserCircle, FaGavel, FaWrench
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';
import { useKlubb } from '../hooks/useKlubb';

export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();
    const slugFromUrl = window.location.pathname.split('/')[1];
    const redirectTo = window.location.origin + (slugFromUrl ? `/${slugFromUrl}` : '/');

    const { klubb, laster } = useKlubb(slug);
    const { currentUser, signOut } = useAuth();
    const {
        email,
        setEmail,
        status,
        handleGoogleLogin,
        handleFacebookLogin,
        handleMagicLink
    } = useLogin(redirectTo);

    const isAdmin = currentUser?.email?.toLowerCase() === klubb?.adminEpost?.toLowerCase();
    const navigate = useNavigate();

    return (
        <SlugContext.Provider value={slug}>
            <Navbar bg="light" expand="sm" className="border-bottom w-100 p-1 m-0">
                <div className="w-100 d-flex justify-content-between align-items-center px-0">
                    <NavbarBrandMedKlubb slug={slug} klubbnavn={laster ? 'Laster...' : klubb?.navn ?? 'Ukjent klubb'} />
                    <Navbar.Toggle aria-controls="nav-collapse" className="me-2" />
                </div>

                <Navbar.Collapse id="nav-collapse">
                    <Nav className="ms-auto px-1 py-0">
                        <NavDropdown
                            title={
                                currentUser
                                    ? <><FaUser className="me-1" />{currentUser.email}</>
                                    : <><FaSignInAlt className="me-1" />Logg inn</>
                            }
                            align="end"
                            id="user-dropdown"
                        >
                            {currentUser ? (
                                <>
                                    {slug && (
                                        <NavDropdown.Item as={Link} to={`/${slug}/minside`}>
                                            <FaUserCircle className="me-2" />
                                            Min side
                                        </NavDropdown.Item>
                                    )}
                                    <NavDropdown.Item onClick={() => signOut(() => {
                                        if (slug) {
                                            navigate(`/${slug}`);
                                        } else {
                                            navigate('/');
                                        }
                                    })}>
                                        <FaSignOutAlt className="me-2" />
                                        Logg ut
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    {slug && (
                                        <>
                                            <NavDropdown.Item as={Link} to={`/${slug}`}>
                                                <FaCalendarAlt className="me-2" />
                                                Book bane
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to={`/${slug}/reglement`}>
                                                <FaGavel className="me-2" />
                                                Reglement
                                            </NavDropdown.Item>
                                            {isAdmin && (
                                                <>
                                                    <NavDropdown.Item as={Link} to={`/${slug}/admin`}>
                                                        <FaWrench className="me-2" />
                                                        Rediger klubb
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to={`/${slug}/admin/baner`}>
                                                        <FaWrench className="me-2" />
                                                        Rediger baner
                                                    </NavDropdown.Item>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <NavDropdown.Item onClick={handleGoogleLogin}>
                                        <FcGoogle size={18} className="me-2" />
                                        Logg inn med Google
                                    </NavDropdown.Item>
                                    <NavDropdown.Item onClick={handleFacebookLogin}>
                                        <FaFacebook size={18} className="me-2" />
                                        Logg inn med Facebook
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <Form onSubmit={handleMagicLink} className="px-3">
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
                                </>
                            )}
                        </NavDropdown>
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
