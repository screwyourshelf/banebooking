import { useState } from 'react';
import { supabase } from '../supabase.js';
import { toast } from 'sonner';

export function useLogin(redirectTo: string) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'input' | 'verify'>('input');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'done' | 'error'>('idle');

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (error) toast.error(error.message);
    };

    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo },
        });
        if (error) toast.error(error.message);
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
        });
        setStatus(error ? 'error' : 'sent');
        if (error) {
            toast.error('E-postlogin-feil: ' + error.message);
        } else {
            toast.success('Lenke sendt - sjekk innboksen!');
        }
    };

    const sendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: true },
        });
        if (error) {
            toast.error('Kunne ikke sende kode: ' + error.message);
            setStatus('error');
        } else {
            toast.success('Kode sendt - sjekk e-posten din');
            setStep('verify');
            setStatus('idle');
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('verifying');
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        if (error) {
            toast.error('Feil kode: ' + error.message);
            setStatus('error');
        } else {
            toast.success('Innlogging fullført!');
            setStatus('done');
            window.location.reload(); // eller redirect
        }
    };

    return {
        email,
        setEmail,
        otp,
        setOtp,
        status,
        setStatus,
        step,
        setStep,
        handleGoogleLogin,
        handleFacebookLogin,
        handleMagicLink,
        sendOtp,
        verifyOtp,
    };
}
