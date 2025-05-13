import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5015',
                changeOrigin: true,
                secure: false
            }
        }
    },
    define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://wfklkakrogxbhozxhtqd.supabase.co'),
		'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indma2xrYWtyb2d4YmhvenhodHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDk0MjEsImV4cCI6MjA2MjQ4NTQyMX0.RK4dQ05OSiU_88dOi4qakHKoL0_zpUuZjAN9au57KIE'),
    }
})