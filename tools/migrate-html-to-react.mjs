import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
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

const scripts = {
  'index.html': ['js/script.js', 'js/menu.js'],
  'aprender/tutorial.html': ['../js/tutorial.js', '../js/menu.js'],
  'aprender/visual-guide.html': ['../js/visual-guide.js', '../js/menu.js'],
  'aprender/tiles.html': ['../js/tiles.js', '../js/menu.js'],
  'aprender/machi.html': ['../data/machi-data.js', '../js/machi.js', '../js/menu.js'],
  'aprender/yaku-reference.html': ['../data/yaku-data.js', '../js/yaku-reference.js', '../js/menu.js'],
  'aprender/score.html': ['../js/score.js', '../js/menu.js'],
  'aprender/dora.html': ['../data/dora-data.js', '../js/ref.js', 'inline:initReference("doraReference")', '../js/menu.js'],
  'aprender/eficiencia.html': ['../data/eficiencia-data.js', '../js/ref.js', 'inline:initReference("eficienciaReference")', '../js/menu.js'],
  'aprender/defensa.html': ['../data/defensa-data.js', '../js/ref.js', 'inline:initReference("defensaReference")', '../js/menu.js'],
  'aprender/reglas.html': ['../data/reglas-data.js', '../js/ref.js', 'inline:initReference("reglasReference")', '../js/menu.js'],
  'practicar/yaku.html': ['../js/yaku.js', '../js/menu.js'],
};

const practiceScripts = ['../js/api.js', '../js/practice-module.js', '../js/menu.js'];
const resourceScripts = ['../js/menu.js'];

function pageScripts(page) {
  const list = scripts[page] ?? (page.startsWith('practicar/') ? practiceScripts : page.startsWith('recursos/') ? resourceScripts : []);
  return list.map((src) => src.startsWith('inline:') ? `    <script>${src.slice(7)};</script>` : `    <script src="${src}"></script>`).join('\n');
}

for (const page of pages) {
  const source = join(root, page);
  const backup = join(root, 'legacy-pages', page);
  if (!existsSync(backup)) {
    mkdirSync(dirname(backup), { recursive: true });
    cpSync(source, backup);
  }
  const nested = page !== 'index.html';
  const prefix = nested ? '../' : '';
  const previous = readFileSync(source, 'utf8');
  const title = previous.match(/<title>([^<]+)/)?.[1] ?? 'Rincón Riichi';
  writeFileSync(source, `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#fdf9f7" />
    <title>${title}</title>
    <link rel="icon" type="image/svg+xml" href="${prefix}assets/logo-rincon-riichi.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${prefix}src/main.tsx"></script>
${pageScripts(page)}
  </body>
</html>
`);
}

console.log(`Migradas ${pages.length} entradas HTML a React.`);
