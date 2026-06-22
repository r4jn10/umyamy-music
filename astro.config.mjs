// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages でホストするための設定。必要に応じてユーザー名（または組織名）に変更してください。
  site: 'https://wyksy.github.io',
  base: '/ClaudeUmyami', // リポジトリ名

  vite: {
    plugins: [tailwindcss()]
  }
});