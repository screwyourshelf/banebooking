import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function LoginPage() {
    const [email, setEmail] = useState('');  // Legg til state for email
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sjekk om brukeren allerede er logget inn
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setRedirecting(true);  // Hvis brukeren er logget inn, sett flagget for omdirigering
            }
        };

        checkUser();  // Sjekk om bruker er logget inn
    }, []);

    // Hvis vi er i ferd med � omdirigere, vis brukeren MinSide
    if (redirecting) {
        return <Navigate to="/minside" replace />;  // Bruk Navigate for � gj�re omdirigeringen til MinSide
    }

    // Funksjon for � h�ndtere Google login
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            setError(error.message);  // Hvis det er en feil under login, vis feilmeldingen
        }
    };

    // Funksjon for � h�ndtere e-post login med magic link
    const handleEmailLogin = async () => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
        });
        if (error) {
            setError(error.message);  // Hvis det er en feil, vis feilmelding
        } else {
            setRedirecting(true);  // Sett omdirigeringsflagget hvis alt g�r bra
        }
    };

    return (
        <div className="container mt-5">
            <h2>Du m� logge inn</h2>
            <p>For � f� tilgang til Min Side, vennligst logg inn med Google, Facebook, eller e-post.</p>

            {/* Google Login Button */}
            <button onClick={handleGoogleLogin} className="btn btn-danger mt-3">
                <i className="fab fa-google"></i> Logg inn med Google
            </button>

            {/* E-post login */}
            <div className="mt-4">
                <input
                    type="email"
                    placeholder="Din e-post"
                    value={email}  // Bind inputen til state
                    onChange={(e) => setEmail(e.target.value)}  // Oppdaterer email state
                    className="form-control"
                />
                <button onClick={handleEmailLogin} className="btn btn-primary mt-3">
                    Send magisk lenke
                </button>
            </div>

            {/* Feilmelding */}
            {error && <div className="text-danger mt-3">{error}</div>}
        </div>
    );
}
