// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * ビルド後の HTML から <!-- コメント --> を削除する。
 * ソース側のコメントは開発用に残しつつ、公開物には含めない。
 * @returns {import('astro').AstroIntegration}
 */
function stripHtmlComments() {
  return {
    name: 'strip-html-comments',
    hooks: {
      'astro:build:done': async ({ assets }) => {
        const pages = [...assets.values()].flat().filter((url) => url.pathname.endsWith('.html'));
        for (const url of pages) {
          const html = await readFile(url, 'utf-8');
          await writeFile(url, html.replace(/<!--[\s\S]*?-->/g, ''), 'utf-8');
        }
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  // 独自ドメイン（お名前.com 取得）を GitHub Pages に設定。ルート配信なので base は付けない。
  site: 'https://umyamy-music.com',

  integrations: [stripHtmlComments()],

  vite: {
    plugins: [tailwindcss()]
  }
});