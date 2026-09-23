import type { LearnKind } from '../domain/learnCatalog';
import { TutorialWorkspace } from './TutorialWorkspace';

function TilesWorkspace() {
  return <><section className="tiles-card sticker-panel" aria-live="polite"><div className="tiles-header"><p className="subtitle" data-i18n="subtitle">Aprende primero las familias de fichas.</p></div><div className="family-tabs" id="familyTabs" aria-label="Familias de fichas" /><div className="tiles-stage"><div className="tile-strip" id="tileStrip" /></div><div className="slide-text"><span className="status ready" id="slideCount">1 / 5</span><h2 id="familyTitle" /><p id="familyDescription" /></div><div className="carousel-actions"><button className="big-button blue" id="prevButton" data-i18n="prev">Anterior</button><button className="big-button green" id="nextButton" data-i18n="next">Siguiente</button></div></section><div className="tile-modal" id="tileModal" role="dialog" aria-modal="true" aria-labelledby="tileModalTitle" hidden><div className="tile-modal-backdrop" id="tileModalBackdrop" /><div className="tile-modal-card sticker-panel"><button className="tile-modal-close" id="tileModalClose" aria-label="Cerrar">✕</button><div className="tile-modal-tile"><img id="tileModalImage" src="" alt="" /></div><div className="tile-modal-copy"><p className="eyebrow" data-i18n="tileModal.label">Ficha</p><h3 id="tileModalTitle" /><p className="tile-modal-fact" id="tileModalFact" /><div className="tile-modal-tip" id="tileModalTip"><span className="tile-modal-tip-label" data-i18n="tileModal.tipLabel">Para memorizarla</span><p id="tileModalMnemonic" /></div></div></div></div></>;
}

function VisualGuideWorkspace() {
  return <section className="visual-guide" aria-live="polite"><header className="visual-guide-header"><div><p className="eyebrow" data-i18n="eyebrow">Bases de Riichi</p><h1 data-i18n="title">Guía visual de Riichi</h1></div><p className="subtitle" data-i18n="subtitle">Un recorrido visual por la mesa, la mano, las llamadas, las esperas y el puntaje.</p></header><section className="guide-stage sticker-panel"><button className="guide-arrow guide-prev" id="guidePrev" aria-label="Anterior">←</button><article className="guide-card" id="guideCard" /><button className="guide-arrow guide-next" id="guideNext" aria-label="Siguiente">→</button></section><footer className="guide-footer"><div className="guide-progress"><span id="guideCounter">1 / 1</span><div className="guide-dots" id="guideDots" /></div><p data-i18n="hint">Usa las flechas para avanzar.</p></footer></section>;
}

function ScoreWorkspace() {
  return <section className="score-page sticker-panel"><div className="score-tabs" role="tablist" aria-label="Secciones de puntaje"><button className="score-tab is-active" type="button" data-panel="dealer" data-i18n="tabDealer">Dealer</button><button className="score-tab" type="button" data-panel="nonDealer" data-i18n="tabNonDealer">No dealer</button><button className="score-tab" type="button" data-panel="fu" data-i18n="tabFu">Fu</button></div><section className="score-panel is-active" id="dealerPanel"><div className="torpedo-board" id="dealerBoard" /></section><section className="score-panel" id="nonDealerPanel"><div className="torpedo-board" id="nonDealerBoard" /></section><section className="score-panel" id="fuPanel"><div className="panel-heading"><h2 data-i18n="fuTitle">¿Qué da fu?</h2><p data-i18n="fuHelp">Suma los minipuntos y redondea hacia arriba.</p></div><aside className="fu-base-note"><strong data-i18n="fuBaseNoteTitle">Todas las manos parten en 20 fu</strong><span data-i18n="fuBaseNoteText">Luego suma solo los bonos que aplican.</span></aside><div className="fu-grid" id="fuGrid" /></section></section>;
}

export function LearnWorkspace({ kind }: { kind: LearnKind }) {
  if (kind === 'tutorial') return <TutorialWorkspace />;
  if (kind === 'tiles') return <TilesWorkspace />;
  if (kind === 'visualGuide') return <VisualGuideWorkspace />;
  if (kind === 'machi') return <section className="machi-grid" id="machiGrid" aria-label="Tipos de espera" />;
  if (kind === 'yakuReference') return <section className="yakuref-grid" id="yakurefGrid" aria-label="Yakus" />;
  if (kind === 'score') return <ScoreWorkspace />;
  return <section className="ref-grid" id="refGrid" aria-label="Referencia" />;
}
