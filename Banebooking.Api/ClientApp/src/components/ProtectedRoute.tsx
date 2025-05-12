import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Laster ...</div>;
    if (!user) return <Navigate to="/" replace />;

    return <>{children}</>;
}
