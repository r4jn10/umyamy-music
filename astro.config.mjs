// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 独自ドメイン（お名前.com 取得）を GitHub Pages に設定。ルート配信なので base は付けない。
  site: 'https://umyamy-music.com',

  vite: {
    plugins: [tailwindcss()]
  }
});