export type LearnKind = 'tutorial' | 'visualGuide' | 'tiles' | 'machi' | 'yakuReference' | 'score' | 'reference';
export type LearnDefinition = { kind: LearnKind; title: string; bodyClass: string; shellClass: string };

const byFile: Record<string, LearnDefinition> = {
  'tutorial.html': { kind: 'tutorial', title: 'Tutorial', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'visual-guide.html': { kind: 'visualGuide', title: 'Guía visual', bodyClass: 'visual-guide-body', shellClass: 'visual-guide-shell' },
  'tiles.html': { kind: 'tiles', title: 'Fichas', bodyClass: 'tiles-body', shellClass: 'tiles-shell' },
  'machi.html': { kind: 'machi', title: 'Tipos de Espera', bodyClass: 'machi-body', shellClass: 'machi-shell' },
  'yaku-reference.html': { kind: 'yakuReference', title: 'Guía de Yakus', bodyClass: 'yakuref-body', shellClass: 'yakuref-shell' },
  'score.html': { kind: 'score', title: 'Puntajes', bodyClass: 'score-body', shellClass: 'score-shell' },
  'dora.html': { kind: 'reference', title: 'Dora', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'eficiencia.html': { kind: 'reference', title: 'Eficiencia de Fichas', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'defensa.html': { kind: 'reference', title: 'Defensa', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'reglas.html': { kind: 'reference', title: 'Reglas Especiales', bodyClass: 'ref-body', shellClass: 'ref-shell' },
};

export function getLearnDefinition(pathname: string): LearnDefinition {
  return byFile[pathname.split('/').pop() ?? ''] ?? byFile['tutorial.html'];
}
