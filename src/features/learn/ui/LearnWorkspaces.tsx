import type { LearnKind } from '../domain/learnCatalog';
import { TutorialWorkspace } from './TutorialWorkspace';
import { TilesWorkspace } from './TilesWorkspace';
import { MachiWorkspace } from './MachiWorkspace';
import { YakuRefWorkspace } from './YakuRefWorkspace';
import { DoraWorkspace } from './DoraWorkspace';
import { ScoreWorkspace } from './ScoreWorkspace';
import { GuideWorkspace } from './GuideWorkspace';
import { DEFENSA_GUIDE, REGLAS_GUIDE } from './guideConfigs';

export function LearnWorkspace({ kind }: { kind: LearnKind }) {
  if (kind === 'tutorial') return <TutorialWorkspace />;
  if (kind === 'tiles') return <TilesWorkspace />;
  if (kind === 'machi') return <MachiWorkspace />;
  if (kind === 'dora') return <DoraWorkspace />;
  if (kind === 'defensa') return <GuideWorkspace config={DEFENSA_GUIDE} />;
  if (kind === 'reglas') return <GuideWorkspace config={REGLAS_GUIDE} />;
  if (kind === 'yakuReference') return <YakuRefWorkspace />;
  if (kind === 'score') return <ScoreWorkspace />;
  return <section className="ref-grid" id="refGrid" aria-label="Referencia" />;
}
