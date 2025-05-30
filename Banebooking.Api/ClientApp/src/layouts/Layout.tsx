import { Outlet, useNavigate, useParams, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaUser, FaFacebook, FaSignInAlt, FaSignOutAlt, FaCalendarAlt,
    FaUserCircle, FaGavel, FaWrench
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu.js';

import { useAuth } from '../hooks/useAuth.js';
import { useLogin } from '../hooks/useLogin.js';
import { useKlubb } from '../hooks/useKlubb.js';
import NavbarBrandMedKlubb from '../components/NavbarBrandMedKlubb.js';
import Spinner from '../components/ui/spinner.js';
import React from 'react';

export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();
    const { klubb, laster } = useKlubb(slug);
    const { currentUser, signOut } = useAuth();
    const {
        email,
        setEmail,
        status,
        handleGoogleLogin,
        handleFacebookLogin,
        handleMagicLink
    } = useLogin(window.location.origin + (slug ? `/${slug}` : ''));

    const isAdmin = currentUser?.email?.toLowerCase() === klubb?.adminEpost?.toLowerCase();
    const navigate = useNavigate();

    return (
        <SlugContext.Provider value={slug}>
            <header className="w-full border-b px-2 py-1 flex justify-between items-center bg-white">
                <NavbarBrandMedKlubb
                    slug={slug}
                    klubbnavn={laster ? 'Laster...' : klubb?.navn ?? 'Ukjent klubb'}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 px-2 text-xs flex items-center gap-2">
                            {currentUser ? (
                                <>
                                    <FaUser className="text-gray-500" />
                                    {currentUser.email}
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt className="text-gray-500" />
                                    Logg inn
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 space-y-0.5">
                        {currentUser ? (
                            <>
                                {slug && (
                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/minside`}>
                                            <FaUserCircle className="mr-2" />Min side
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => signOut(() => navigate(slug ? `/${slug}` : '/'))}>
                                    <FaSignOutAlt className="mr-2" />Logg ut
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {slug && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link to={`/${slug}`}>
                                                <FaCalendarAlt className="mr-2" />Book bane
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to={`/${slug}/reglement`}>
                                                <FaGavel className="mr-2" />Reglement
                                            </Link>
                                        </DropdownMenuItem>
                                        {isAdmin && (
                                            <>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/${slug}/admin`}>
                                                        <FaWrench className="mr-2" />Rediger klubb
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/${slug}/admin/baner`}>
                                                        <FaWrench className="mr-2" />Rediger baner
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/${slug}/admin/massebooking`}>
                                                        <FaWrench className="mr-2" />Avansert booking
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem onClick={handleGoogleLogin}>
                                    <FcGoogle size={18} className="mr-2" />Logg inn med Google
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleFacebookLogin}>
                                    <FaFacebook size={18} className="mr-2" />Logg inn med Facebook
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <form onSubmit={handleMagicLink} className="space-y-1 px-2 w-full">
                                    <label htmlFor="email" className="text-xs text-gray-600">
                                        Logg inn med e-post
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="din@epost.no"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="text-sm h-8"
                                    />
                                    <Button type="submit" size="sm" disabled={status === 'sending'} className="w-full h-8 text-sm">
                                        {status === 'sending' ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-2">Sender...</span>
                                            </>
                                        ) : (
                                            'Send lenke'
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <main className="w-full max-w-screen-sm mx-auto px-2 py-2">
                <Outlet />
            </main>

            <ToastContainer position="bottom-center" autoClose={3000} />
        </SlugContext.Provider>
    );
}
