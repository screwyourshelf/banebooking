import { createClient } from '@supabase/supabase-js'

// TODO: Bytt til import.meta.env.VITE_SUPABASE_URL osv. når miljøvariabler fungerer i deploy
const url = 'https://wfklkakrogxbhozxhtqd.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indma2xrYWtyb2d4YmhvenhodHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDk0MjEsImV4cCI6MjA2MjQ4NTQyMX0.RK4dQ05OSiU_88dOi4qakHKoL0_zpUuZjAN9au57KIE'

export const supabase = createClient(url, key)