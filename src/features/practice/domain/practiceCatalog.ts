export type PracticeKey = 'waits' | 'han' | 'calc' | 'valores' | 'furiten' | 'fu' | 'esperaTipo' | 'esperaFichas' | 'chinitsu' | 'tileName' | 'yaku';

export type PracticeDefinition = { key: PracticeKey; title: string; chibi: string; customStart?: boolean };

const byFile: Record<string, PracticeDefinition> = {
  'waits.html': { key: 'waits', title: 'Encuentra la Espera', chibi: 'chibi-wait.png' },
  'han.html': { key: 'han', title: 'Cuenta los Han', chibi: 'chibi-score.png' },
  'calc.html': { key: 'calc', title: 'Cuenta el Puntaje', chibi: 'chibi-score.png' },
  'valores.html': { key: 'valores', title: 'Tabla de Valores', chibi: 'chibi-score.png' },
  'furiten.html': { key: 'furiten', title: '¿Estoy en Furiten?', chibi: 'chibi-thinking.png' },
  'fu.html': { key: 'fu', title: 'Cuenta los Fu', chibi: 'chibi-score.png' },
  'espera-tipo.html': { key: 'esperaTipo', title: '¿Qué espera es?', chibi: 'chibi-wait.png' },
  'espera-fichas.html': { key: 'esperaFichas', title: '¿Qué fichas esperas?', chibi: 'chibi-wait.png' },
  'chinitsu.html': { key: 'chinitsu', title: '¿Chinitsu?', chibi: 'chibi-thinking.png' },
  'que-ficha-es.html': { key: 'tileName', title: '¿Qué ficha es?', chibi: 'chibi-tile-name.png', customStart: true },
  'yaku.html': { key: 'yaku', title: 'Identifica el Yaku', chibi: 'chibi-yaku.png', customStart: true },
};

export function getPracticeDefinition(pathname: string): PracticeDefinition {
  const file = pathname.split('/').pop() ?? '';
  return byFile[file] ?? byFile['waits.html'];
}

/** Every drill, in the order of the rail at the bottom of the practice pages. */
export const PRACTICE_RAIL: Array<{ key: PracticeKey; file: string; title: string; sub: string; glyph: string }> = [
  { key: 'tileName', file: 'que-ficha-es.html', title: '¿Qué ficha es?', sub: 'Reconoce las fichas', glyph: '名' },
  { key: 'yaku', file: 'yaku.html', title: 'Identifica el Yaku', sub: 'Patrones ganadores', glyph: '役' },
  { key: 'waits', file: 'waits.html', title: 'Encuentra la Espera', sub: 'Fichas que completan', glyph: '待' },
  { key: 'fu', file: 'fu.html', title: 'Cuenta los Fu', sub: 'Minipuntos', glyph: '符' },
  { key: 'han', file: 'han.html', title: 'Cuenta los Han', sub: 'Yaku y valor', glyph: '翻' },
  { key: 'calc', file: 'calc.html', title: 'Cuenta el Puntaje', sub: 'Del han al pago', glyph: '算' },
  { key: 'valores', file: 'valores.html', title: 'Tabla de Valores', sub: 'Han + fu + dealer', glyph: '価' },
  { key: 'furiten', file: 'furiten.html', title: '¿Estoy en Furiten?', sub: 'Revisa tu río', glyph: '振' },
  { key: 'esperaTipo', file: 'espera-tipo.html', title: '¿Qué espera es?', sub: 'Nombre de la espera', glyph: '問' },
  { key: 'esperaFichas', file: 'espera-fichas.html', title: '¿Qué fichas esperas?', sub: 'Todas las que sirven', glyph: '選' },
  { key: 'chinitsu', file: 'chinitsu.html', title: '¿Chinitsu?', sub: 'Un solo palo', glyph: '清' },
];
