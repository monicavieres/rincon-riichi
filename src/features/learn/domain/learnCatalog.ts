export type LearnKind = 'tutorial' | 'tiles' | 'machi' | 'dora' | 'defensa' | 'reglas' | 'yakuReference' | 'score' | 'demoA' | 'demoB' | 'demoC' | 'demoD' | 'reference';
export type LearnDefinition = { kind: LearnKind; title: string; bodyClass: string; shellClass: string };

const byFile: Record<string, LearnDefinition> = {
  'tutorial.html': { kind: 'tutorial', title: 'Tutorial', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'tiles.html': { kind: 'tiles', title: 'Fichas', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'machi.html': { kind: 'machi', title: 'Tipos de Espera', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'yaku-reference.html': { kind: 'yakuReference', title: 'Guía de Yakus', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'score.html': { kind: 'score', title: 'Puntajes', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'dora.html': { kind: 'dora', title: 'Dora', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'defensa.html': { kind: 'defensa', title: 'Defensa', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'reglas.html': { kind: 'reglas', title: 'Reglas Especiales', bodyClass: 'ref-body', shellClass: 'ref-shell' },
  'demo-a.html': { kind: 'demoA', title: 'Tutorial DEMO A', bodyClass: 'ref-body demo-body', shellClass: 'demo-shell' },
  'demo-b.html': { kind: 'demoB', title: 'Tutorial DEMO B', bodyClass: 'ref-body demo-body', shellClass: 'demo-shell' },
  'demo-c.html': { kind: 'demoC', title: 'Tutorial DEMO C', bodyClass: 'ref-body demo-body', shellClass: 'demo-shell' },
  'demo-d.html': { kind: 'demoD', title: 'Tutorial DEMO D', bodyClass: 'ref-body demo-body', shellClass: 'demo-shell' },
};

export function getLearnDefinition(pathname: string): LearnDefinition {
  return byFile[pathname.split('/').pop() ?? ''] ?? byFile['tutorial.html'];
}
