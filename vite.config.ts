import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cpSync } from 'node:fs';

const projectRoot = import.meta.dirname;

const pages = [
  'index.html',
  'aprender/tutorial.html', 'aprender/visual-guide.html', 'aprender/tiles.html', 'aprender/machi.html',
  'aprender/yaku-reference.html', 'aprender/score.html', 'aprender/dora.html', 'aprender/eficiencia.html',
  'aprender/defensa.html', 'aprender/reglas.html',
  'practicar/yaku.html', 'practicar/waits.html', 'practicar/han.html', 'practicar/calc.html',
  'practicar/valores.html', 'practicar/furiten.html', 'practicar/fu.html', 'practicar/espera-tipo.html',
  'practicar/espera-fichas.html', 'practicar/chinitsu.html', 'practicar/que-ficha-es.html',
  'recursos/fuentes.html', 'recursos/comunidades.html', 'recursos/jugar.html', 'recursos/bibliotecas.html',
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-rincon-static-assets',
      closeBundle() {
        for (const directory of ['assets', 'js', 'data']) {
          cpSync(resolve(projectRoot, directory), resolve(projectRoot, 'dist', directory), { recursive: true });
        }
      },
    },
  ],
  server: { host: '127.0.0.1', port: 8765 },
  preview: { host: '127.0.0.1', port: 8765 },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace(/\.html$/, ''), resolve(projectRoot, page)])),
    },
  },
});
