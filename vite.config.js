import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin.html'),
                listings: resolve(__dirname, 'listings.html'),
                property: resolve(__dirname, 'property.html'),
            },
        },
    },
});
