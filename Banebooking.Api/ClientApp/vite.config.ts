import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('VITE_SUPABASE_URL =', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY =', process.env.VITE_SUPABASE_ANON_KEY);

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
	  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL ?? ''),
	  'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY ?? ''),
	}
})