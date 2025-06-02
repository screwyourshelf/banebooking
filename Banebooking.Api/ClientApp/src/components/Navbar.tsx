import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu.js';

import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';

import {
    FaUser, FaFacebook, FaSignInAlt, FaSignOutAlt,
    FaCalendarAlt, FaUserCircle, FaGavel, FaWrench, FaBars
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { useAuth } from '../hooks/useAuth.js';
import { useLogin } from '../hooks/useLogin.js';
import { useKlubb } from '../hooks/useKlubb.js';
import { useBruker } from '../hooks/useBruker.js';
import NavbarBrandMedKlubb from './NavbarBrandMedKlubb.js';
import Spinner from './ui/spinner.js';
import LoaderSkeleton from './LoaderSkeleton.js';

export default function Navbar() {
    const { slug } = useParams<{ slug: string }>();
    const { klubb, laster } = useKlubb(slug);
    const { currentUser, signOut } = useAuth();
    const { bruker } = useBruker(slug);
    const navigate = useNavigate();

    const {
        email,
        setEmail,
        status,
        handleGoogleLogin,
        handleFacebookLogin,
        handleMagicLink
    } = useLogin(window.location.origin + (slug ? `/${slug}` : ''));

    const erAdmin = bruker?.roller.includes('KlubbAdmin') ?? false;
    const harUtvidetTilgang = bruker?.roller.includes('Utvidet') ?? false;

    return (
        <div className="max-w-screen-lg mx-auto flex justify-between items-center px-2 py-1">
            <NavbarBrandMedKlubb
                slug={slug}
                klubbnavn={laster ? <LoaderSkeleton /> : klubb?.navn ?? 'Ukjent klubb'}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-8 px-2 flex items-center gap-2 sm:text-xs sm:px-2"
                    >
                        <FaBars className="text-gray-600 sm:hidden" />
                        <span className="hidden sm:inline-flex items-center gap-2">
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
                        </span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 space-y-0.5">
                    {currentUser ? (
                        <>
                            {slug && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/minside`}>
                                            <FaUserCircle className="mr-2" />Min side
                                        </Link>
                                    </DropdownMenuItem>
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
                                </>
                            )}

                            {(erAdmin || harUtvidetTilgang) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                        {erAdmin ? 'Admin' : 'Utvidet tilgang'}
                                    </div>

                                    {erAdmin && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/klubb`}>
                                                    <FaWrench className="mr-2" />Klubb
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/baner`}>
                                                    <FaWrench className="mr-2" />Baner
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/brukere`}>
                                                    <FaWrench className="mr-2" />Brukere
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/arrangement`}>
                                            <FaCalendarAlt className="mr-2" />Arrangement
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut(() => navigate(slug ? `/${slug}` : '/'))}>
                                <FaSignOutAlt className="mr-2" />Logg ut
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuItem onClick={handleGoogleLogin} disabled={status === 'sending'}>
                                <FcGoogle size={18} className="mr-2" />Logg inn med Google
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleFacebookLogin} disabled={status === 'sending'}>
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
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={status === 'sending'}
                                    className="w-full h-8 text-sm"
                                >
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
        </div>
    );
}
