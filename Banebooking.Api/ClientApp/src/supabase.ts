import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    throw new Error('Supabase URL eller ANON_KEY mangler – sjekk miljøvariabler.');
}

export const supabase = createClient(url, key);