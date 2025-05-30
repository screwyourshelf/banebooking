import { useEffect, useState } from 'react';
import { supabase } from '../supabase.js'
import type { User } from '@supabase/supabase-js';

export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (isMounted) {
                setUser(user);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setUser(session?.user ?? null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return user;
}
