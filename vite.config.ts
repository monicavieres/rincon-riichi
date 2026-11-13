import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cpSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const projectRoot = import.meta.dirname;

const pages = [
  'index.html',
  'aprender/tutorial.html', 'aprender/tiles.html', 'aprender/machi.html',
  'aprender/yaku-reference.html', 'aprender/score.html', 'aprender/dora.html',
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
      // Serves the mahjong AI locally (in production it is the Vercel function in api/mahjong/advise.js).
      // Runs before the /api proxy below, which forwards everything else to the remote API.
      name: 'rincon-mahjong-ai-dev-api',
      configureServer(server) {
        server.middlewares.use('/api/mahjong/advise', async (req, res) => {
          const { handleAdvise, describeApi } = await import(pathToFileURL(resolve(projectRoot, 'backend/mahjong-ai/http.js')).href);
          const send = (status: number, body: unknown) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(body));
          };
          if (req.method === 'GET') return send(200, describeApi());
          if (req.method !== 'POST') return send(405, { error: 'method_not_allowed' });
          let text = '';
          for await (const chunk of req) text += chunk;
          let body: unknown;
          try { body = JSON.parse(text); } catch { return send(400, { error: 'invalid_json' }); }
          const out = await handleAdvise(body);
          return send(out.status, out.body);
        });
      },
    },
    {
      name: 'copy-rincon-static-assets',
      closeBundle() {
        for (const directory of ['assets', 'js', 'data']) {
          cpSync(resolve(projectRoot, directory), resolve(projectRoot, 'dist', directory), { recursive: true });
        }
      },
    },
  ],
  server: {
    host: '127.0.0.1',
    port: 8765,
    proxy: {
      '/api': {
        target: 'https://rincon-riichi-api.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: { host: '127.0.0.1', port: 8765 },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace(/\.html$/, ''), resolve(projectRoot, page)])),
    },
  },
});
