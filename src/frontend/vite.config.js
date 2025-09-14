import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    server: {
        allowedHosts: [
            'realmspriter.com',
            'www.realmspriter.com'
        ],
        port: 5173,
        open: true,
    },
});