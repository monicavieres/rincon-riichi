import type { LearnKind } from '../domain/learnCatalog';
import { TutorialWorkspace } from './TutorialWorkspace';
import { TilesWorkspace } from './TilesWorkspace';
import { MachiWorkspace } from './MachiWorkspace';
import { YakuRefWorkspace } from './YakuRefWorkspace';
import { DoraWorkspace } from './DoraWorkspace';

function ScoreWorkspace() {
  return <section className="score-page sticker-panel"><div className="score-tabs" role="tablist" aria-label="Secciones de puntaje"><button className="score-tab is-active" type="button" data-panel="dealer" data-i18n="tabDealer">Dealer</button><button className="score-tab" type="button" data-panel="nonDealer" data-i18n="tabNonDealer">No dealer</button><button className="score-tab" type="button" data-panel="fu" data-i18n="tabFu">Fu</button></div><section className="score-panel is-active" id="dealerPanel"><div className="torpedo-board" id="dealerBoard" /></section><section className="score-panel" id="nonDealerPanel"><div className="torpedo-board" id="nonDealerBoard" /></section><section className="score-panel" id="fuPanel"><div className="panel-heading"><h2 data-i18n="fuTitle">¿Qué da fu?</h2><p data-i18n="fuHelp">Suma los minipuntos y redondea hacia arriba.</p></div><aside className="fu-base-note"><strong data-i18n="fuBaseNoteTitle">Todas las manos parten en 20 fu</strong><span data-i18n="fuBaseNoteText">Luego suma solo los bonos que aplican.</span></aside><div className="fu-grid" id="fuGrid" /></section></section>;
}

export function LearnWorkspace({ kind }: { kind: LearnKind }) {
  if (kind === 'tutorial') return <TutorialWorkspace />;
  if (kind === 'tiles') return <TilesWorkspace />;
  if (kind === 'machi') return <MachiWorkspace />;
  if (kind === 'dora') return <DoraWorkspace />;
  if (kind === 'yakuReference') return <YakuRefWorkspace />;
  if (kind === 'score') return <ScoreWorkspace />;
  return <section className="ref-grid" id="refGrid" aria-label="Referencia" />;
}
