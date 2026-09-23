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
