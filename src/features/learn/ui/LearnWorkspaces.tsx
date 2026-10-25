import type { LearnKind } from '../domain/learnCatalog';
import { TutorialWorkspace } from './TutorialWorkspace';
import { TilesWorkspace } from './TilesWorkspace';

function ScoreWorkspace() {
  return <section className="score-page sticker-panel"><div className="score-tabs" role="tablist" aria-label="Secciones de puntaje"><button className="score-tab is-active" type="button" data-panel="dealer" data-i18n="tabDealer">Dealer</button><button className="score-tab" type="button" data-panel="nonDealer" data-i18n="tabNonDealer">No dealer</button><button className="score-tab" type="button" data-panel="fu" data-i18n="tabFu">Fu</button></div><section className="score-panel is-active" id="dealerPanel"><div className="torpedo-board" id="dealerBoard" /></section><section className="score-panel" id="nonDealerPanel"><div className="torpedo-board" id="nonDealerBoard" /></section><section className="score-panel" id="fuPanel"><div className="panel-heading"><h2 data-i18n="fuTitle">¿Qué da fu?</h2><p data-i18n="fuHelp">Suma los minipuntos y redondea hacia arriba.</p></div><aside className="fu-base-note"><strong data-i18n="fuBaseNoteTitle">Todas las manos parten en 20 fu</strong><span data-i18n="fuBaseNoteText">Luego suma solo los bonos que aplican.</span></aside><div className="fu-grid" id="fuGrid" /></section></section>;
}

export function LearnWorkspace({ kind }: { kind: LearnKind }) {
  if (kind === 'tutorial') return <TutorialWorkspace />;
  if (kind === 'tiles') return <TilesWorkspace />;
  if (kind === 'machi') return <><section className="machi-filters sticker-panel" aria-labelledby="machiFilterTitle"><div className="machi-filter-heading"><div><p className="eyebrow" data-i18n="filterEyebrow">Explora</p><h2 id="machiFilterTitle" data-i18n="filterTitle">Filtra los tipos de espera</h2></div><span className="machi-result-count" id="machiResultCount" aria-live="polite" /></div><div className="machi-filter-controls"><label className="machi-filter-field"><span data-i18n="filterTiles">Fichas ganadoras disponibles</span><select id="machiTileCountFilter" /></label><label className="machi-filter-field"><span data-i18n="filterFu">Fu posible de la espera</span><select id="machiFuFilter" /></label><button className="machi-filter-reset" id="machiFilterReset" type="button" data-i18n="filterReset">Limpiar filtros</button></div><p className="machi-filter-hint" data-i18n="filterHint">Se cuentan cuatro copias por ficha menos las que ya aparecen en la forma. En esperas complejas, el fu puede cambiar según la ficha ganadora.</p></section><section className="machi-grid" id="machiGrid" aria-label="Tipos de espera" /></>;
  if (kind === 'yakuReference') return <section className="yakuref-grid" id="yakurefGrid" aria-label="Yakus" />;
  if (kind === 'score') return <ScoreWorkspace />;
  return <section className="ref-grid" id="refGrid" aria-label="Referencia" />;
}
