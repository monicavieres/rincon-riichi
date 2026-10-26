import { useCallback, useEffect, useRef, useState } from 'react';
import { DORA_LIST } from '../domain/doraData';
import { initialLanguage, usePageChrome } from './usePageChrome';

type Lang = 'es' | 'en' | 'pt';
const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK_DIR = 'tiles-fluffystuff-composite';

const UI = {
  es: { info: 'Qué es', data: 'Valor', note: 'Nota', value: 'Valor', example: 'Ejemplo', step: 'Paso', of: 'de', arrows: 'usa las flechas', back: 'Anterior', next: 'Siguiente', rail: 'Pasos del dora', indicator: 'Indicador', dora: 'Dora', tryTitle: 'Pruébalo', tryHelp: 'Toca una ficha: será el indicador. Abajo verás cuál es el dora.', tryRule: 'El dora es la ficha siguiente al indicador.', quiz: 'Guía de yakus', wraps: 'Aquí el ciclo da la vuelta.', aka: 'El aka dora es un 5 rojo: cuenta como dora aparte.' },
  en: { info: 'What it is', data: 'Value', note: 'Note', value: 'Value', example: 'Example', step: 'Step', of: 'of', arrows: 'use the arrows', back: 'Previous', next: 'Next', rail: 'Dora steps', indicator: 'Indicator', dora: 'Dora', tryTitle: 'Try it', tryHelp: 'Tap a tile: it will be the indicator. Below you will see which tile is the dora.', tryRule: 'The dora is the tile that follows the indicator.', quiz: 'Yaku guide', wraps: 'Here the cycle wraps around.', aka: 'The aka dora is a red 5: it counts as dora on its own.' },
  pt: { info: 'O que é', data: 'Valor', note: 'Nota', value: 'Valor', example: 'Exemplo', step: 'Passo', of: 'de', arrows: 'use as setas', back: 'Anterior', next: 'Próxima', rail: 'Passos da dora', indicator: 'Indicador', dora: 'Dora', tryTitle: 'Experimente', tryHelp: 'Toque numa peça: ela será o indicador. Abaixo você verá qual é a dora.', tryRule: 'A dora é a peça seguinte ao indicador.', quiz: 'Guia de yakus', wraps: 'Aqui o ciclo dá a volta.', aka: 'A aka dora é um 5 vermelho: conta como dora à parte.' },
};

const INTRO = {
  es: {
    short: 'Introducción', sub: '¿Qué es el dora?', title: '¿Qué es el dora?', label: 'Antes de empezar',
    body: ['El **dora** es una ficha que **suma 1 han** por cada copia que tengas en tu mano.', 'Cuál es el dora no se decide al azar en tu mano: lo marca el **indicador**, una ficha boca arriba al final del **muro muerto**. El dora es **la siguiente** al indicador.', 'En esta guía verás cómo se elige el dora, sus ciclos, el **aka dora**, el **ura dora** y el **kan dora**. Al final, un ejemplo para probarlo tú.'],
    stageTitle: 'El indicador marca el dora', next: 'Empieza con el indicador →',
  },
  en: {
    short: 'Introduction', sub: 'What is dora?', title: 'What is dora?', label: 'Before we start',
    body: ['The **dora** is a tile that **adds 1 han** for every copy you hold.', 'Which tile is the dora is not up to your hand: the **indicator** marks it, a tile turned face up at the end of the **dead wall**. The dora is **the next one** after the indicator.', 'In this guide you will see how the dora is chosen, its cycles, the **aka dora**, the **ura dora** and the **kan dora**. At the end, an example to try yourself.'],
    stageTitle: 'The indicator marks the dora', next: 'Start with the indicator →',
  },
  pt: {
    short: 'Introdução', sub: 'O que é a dora?', title: 'O que é a dora?', label: 'Antes de começar',
    body: ['A **dora** é uma peça que **soma 1 han** por cada cópia que você tiver na mão.', 'Qual peça é a dora não depende da sua mão: o **indicador** a marca, uma peça virada para cima no fim do **muro morto**. A dora é **a seguinte** ao indicador.', 'Neste guia você verá como a dora é escolhida, seus ciclos, a **aka dora**, a **ura dora** e a **kan dora**. No fim, um exemplo para experimentar.'],
    stageTitle: 'O indicador marca a dora', next: 'Comece pelo indicador →',
  },
};

/** The tile after the indicator: numbers wrap 9 → 1, winds East → South → West → North → East, dragons green → red → white → green. */
export function doraOf(code: string): string {
  const n = Number(code[0]);
  const s = code[1];
  if (s === 'z') {
    if (n <= 4) return `${n === 4 ? 1 : n + 1}z`;
    return `${n === 7 ? 5 : n + 1}z`;
  }
  return `${n === 9 ? 1 : n + 1}${s}`;
}

const rich = (text: string) => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

/** The dora guide, laid out like the other learn modules: stage, inspector and a rail with one stop per idea. */
export function DoraWorkspace() {
  const [language, setLanguage] = useState<Lang>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<'info' | 'data'>('info');
  const [indicator, setIndicator] = useState('4m');
  const theme = usePageChrome(language, setLanguage);
  const railRef = useRef<HTMLElement>(null);
  const ui = UI[language];
  const copy = INTRO[language];
  const total = DORA_LIST.length + 2;
  const intro = index === 0;
  const tryIt = index === total - 1;
  const entry = DORA_LIST[Math.max(0, Math.min(DORA_LIST.length - 1, index - 1))];

  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK_DIR}/${code}.svg`;
  const onFaceError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK_DIR)) img.src = `../assets/${FALLBACK_DIR}/${code}.svg`;
  };
  const open = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(total - 1, next)));
    setTab('info');
  }, [total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === 'ArrowLeft') open(index - 1);
      if (event.key === 'ArrowRight') open(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, open]);

  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !active) return;
    const railBox = rail.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    if (activeBox.left >= railBox.left + 12 && activeBox.right <= railBox.right - 12) return;
    rail.scrollTo({ left: Math.max(0, rail.scrollLeft + (activeBox.left - railBox.left) - (rail.clientWidth - activeBox.width) / 2), behavior: 'auto' });
  }, [index]);

  const tile = (code: string, gold = false, key?: string) => (
    <img key={key ?? code} className={gold ? 'is-gold' : undefined} src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />
  );

  const pair = (indicatorCode: string) => (
    <div className="machi-pair">
      <div className="machi-block"><small>{ui.indicator}</small><div className="machi-row is-small">{tile(indicatorCode)}</div></div>
      <div className="machi-arrow is-side" aria-hidden="true">▶</div>
      <div className="machi-block is-wait"><small>{ui.dora}</small><div className="machi-row is-small">{tile(doraOf(indicatorCode), true)}</div></div>
    </div>
  );

  const stageName = intro ? copy.short : tryIt ? ui.tryTitle : entry.title[language];
  return (
    <section className="table-explorer tutorial-lab machi-lab" aria-label={copy.title}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={stageName}>
          <div className="explorer-progress">
            <span>{stageName}</span>
            <strong>{index + 1}/{total}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
          </div>

          {intro ? (
            <div className="tiles-felt machi-felt" key="intro">
              <div className="machi-name"><b>{copy.stageTitle}</b></div>
              {pair('4m')}
            </div>
          ) : tryIt ? (
            <div className="tiles-felt machi-felt" key="try">
              <div className="machi-name"><b>{ui.tryTitle}</b></div>
              <p className="machi-hint">{ui.tryHelp}</p>
              <div className="yb-palette">
                {['m', 'p', 's', 'z'].map((x) => (
                  <div className="yb-row" key={x}>
                    {Array.from({ length: x === 'z' ? 7 : 9 }, (_, i) => `${i + 1}${x}`).map((code) => (
                      <button type="button" key={code} className={`yb-tile${code === indicator ? ' is-last' : ''}`} onClick={() => setIndicator(code)} aria-label={code}>
                        <img src={face(code)} alt="" draggable={false} onError={(event) => onFaceError(event, code)} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              {pair(indicator)}
            </div>
          ) : (
            <div className="tiles-felt machi-felt" key={entry.title.es}>
              <div className="machi-name"><b>{entry.title[language]}</b><span>{entry.glyph}</span></div>
              <div className="machi-name"><span className="yaku-han">{entry.value[language]}</span></div>
              {entry.tiles.length > 0 ? (
                <div className="machi-block">
                  <small>{ui.example}</small>
                  <div className="machi-row is-small dora-chain">
                    {entry.tiles.flatMap((code, i) => [i > 0 ? <span key={`a${i}`} className="dora-arrow" aria-hidden="true">→</span> : null, tile(code, i === entry.tiles.length - 1 && entry.tiles.length > 1, `${code}-${i}`)])}
                  </div>
                </div>
              ) : <span className="yaku-chip dora-glyph">{entry.glyph}</span>}
              <p className="machi-caption">{entry[language]}</p>
            </div>
          )}

          <div className="explorer-stage-controls" aria-label={ui.rail}>
            <button type="button" onClick={() => open(index - 1)} aria-label={ui.back} disabled={index === 0}>←</button>
            <span>{ui.step} {index + 1} {ui.of} {total} · {ui.arrows}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={ui.next} disabled={index === total - 1}>→</button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" role="tablist">
            {(intro || tryIt ? (['info'] as const) : (['info', 'data'] as const)).map((id) => (
              <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{id === 'info' ? (intro ? copy.short : tryIt ? ui.tryTitle : ui.info) : ui.data}</button>
            ))}
          </nav>
          <div className="explorer-inspector-copy">
            {intro ? (
              <>
                <p className="panel-label">{copy.label}</p>
                <h2>{copy.title}</h2>
                {copy.body.map((line, i) => <p key={i}>{rich(line)}</p>)}
                <div className="yaku-controls"><button type="button" className="sort-button is-primary" onClick={() => open(1)}>{copy.next}</button></div>
              </>
            ) : tryIt ? (
              <>
                <p className="panel-label">{ui.tryTitle}</p>
                <h2>{ui.indicator} → {ui.dora}</h2>
                <p>{ui.tryRule}</p>
                <ul className="body-list">
                  <li><strong>{ui.indicator}</strong>: {indicator}</li>
                  <li><strong>{ui.dora}</strong>: {doraOf(indicator)}{(indicator[0] === '9' && indicator[1] !== 'z') || indicator === '4z' || indicator === '7z' ? ` · ${ui.wraps}` : ''}</li>
                </ul>
                <div className="yaku-controls"><a className="sort-button is-primary" href="yaku-reference.html">{ui.quiz} →</a></div>
              </>
            ) : (
              <>
                <p className="panel-label">{entry.value[language]}</p>
                <h2>{entry.title[language]} <span className="machi-kanji-inline">{entry.glyph}</span></h2>
                {tab === 'info' ? (
                  <>
                    <p>{entry[language]}</p>
                    {entry.note && <ul className="body-list"><li><strong>{ui.note}</strong>: {entry.note}</li></ul>}
                  </>
                ) : (
                  <ul className="body-list"><li><strong>{ui.value}</strong>: {entry.value[language]}</li></ul>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={ui.rail}>
        <button type="button" className={index === 0 ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(0)}>
          <span className="lesson-thumb is-tiles" aria-hidden="true">{['4m', '5m'].map((code) => <img key={code} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} />)}</span>
          <span className="lesson-title"><strong>1. {copy.short}</strong><small>{copy.sub}</small></span>
          <span className="lesson-chev">{chevron}</span>
        </button>
        {DORA_LIST.map((item, i) => (
          <button type="button" key={item.title.es} className={i + 1 === index ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(i + 1)}>
            <span className="lesson-thumb is-tiles" aria-hidden="true">
              {item.tiles.length ? item.tiles.slice(0, 3).map((code, k) => <img key={`${code}-${k}`} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} />) : <b className="dora-thumb">{item.glyph}</b>}
            </span>
            <span className="lesson-title"><strong>{i + 2}. {item.title[language]}</strong><small>{item.value[language]}</small></span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
        <button type="button" className={tryIt ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(total - 1)}>
          <span className="lesson-thumb is-tiles" aria-hidden="true">{['8p', '9p'].map((code) => <img key={code} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} />)}</span>
          <span className="lesson-title"><strong>{total}. {ui.tryTitle}</strong><small>{ui.indicator} → {ui.dora}</small></span>
          <span className="lesson-chev">{chevron}</span>
        </button>
      </nav>
    </section>
  );
}
