/// <reference types="node" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        open: '/aas-tennisklubb',
        proxy: {
            '/api': {
                target: 'http://localhost:5015',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
