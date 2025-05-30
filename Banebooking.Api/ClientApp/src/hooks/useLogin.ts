// src/hooks/useLogin.ts
import { useState } from 'react';
import { supabase } from '../supabase.js'
import { toast } from 'react-toastify';

export function useLogin(redirectTo: string) {
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

    return {
        email,
        setEmail,
        status,
        handleGoogleLogin,
        handleFacebookLogin,
        handleMagicLink
    };
}
