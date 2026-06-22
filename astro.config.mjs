// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages でホストするための設定。必要に応じてユーザー名（または組織名）に変更してください。
  site: 'https://r4jn10.github.io',
  base: '/umyamy-music', // リポジトリ名

  vite: {
    plugins: [tailwindcss()]
  }
});