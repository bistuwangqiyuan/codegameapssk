import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import astroI18next from 'astro-i18next';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()]
    },
    integrations: [
        react(),
        astroI18next({
            defaultLocale: 'en',
            locales: ['en', 'zh'],
            routes: {
                zh: {
                    'learn': 'xuexi',
                    'community': 'shequ',
                    'leaderboard': 'paihangbang',
                    'rewards': 'jiangli',
                    'teacher': 'jiaoshi',
                    'admin': 'guanli'
                }
            }
        })
    ],
    adapter: netlify(),
    output: 'server'
});
