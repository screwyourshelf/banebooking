import { useEffect, useState } from 'react';
import { supabase } from '../supabase.js'
import type { User } from '@supabase/supabase-js';

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

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

    return {
        currentUser,
        setCurrentUser,
        signOut: async (onComplete?: () => void) => {
            await supabase.auth.signOut();
            setCurrentUser(null);
            if (onComplete) {
                onComplete();
            }
        }
    };
}
