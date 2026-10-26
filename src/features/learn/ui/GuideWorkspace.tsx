import { useCallback, useEffect, useRef, useState } from 'react';
import type { GuideEntry } from '../domain/guideTypes';
import { initialLanguage, usePageChrome } from './usePageChrome';

type Lang = 'es' | 'en' | 'pt';
type Intro = { short: string; sub: string; title: string; label: string; body: string[]; stageTitle: string; next: string };
export type GuideConfig = { entries: GuideEntry[]; intro: Record<Lang, Intro>; glyph: string; example: Record<Lang, string[]> };

const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK_DIR = 'tiles-fluffystuff-composite';

const UI = {
  es: { info: 'Qué es', data: 'Valor', note: 'Nota', value: 'Valor', example: 'Ejemplo', step: 'Paso', of: 'de', arrows: 'usa las flechas', back: 'Anterior', next: 'Siguiente', rail: 'Pasos' },
  en: { info: 'What it is', data: 'Value', note: 'Note', value: 'Value', example: 'Example', step: 'Step', of: 'of', arrows: 'use the arrows', back: 'Previous', next: 'Next', rail: 'Steps' },
  pt: { info: 'O que é', data: 'Valor', note: 'Nota', value: 'Valor', example: 'Exemplo', step: 'Passo', of: 'de', arrows: 'use as setas', back: 'Anterior', next: 'Próxima', rail: 'Passos' },
};

const rich = (text: string) => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

/** A reference guide laid out like the other learn modules: an introduction, then one stop per idea. */
export function GuideWorkspace({ config }: { config: GuideConfig }) {
  const [language, setLanguage] = useState<Lang>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<'info' | 'data'>('info');
  const theme = usePageChrome(language, setLanguage);
  const railRef = useRef<HTMLElement>(null);
  const ui = UI[language];
  const copy = config.intro[language];
  const total = config.entries.length + 1;
  const intro = index === 0;
  const entry = config.entries[Math.max(0, index - 1)];

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

  const stageName = intro ? copy.short : entry.title[language];
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
              <span className="yaku-chip dora-glyph">{config.glyph}</span>
              {config.example[language].length > 0 && <p className="machi-caption">{config.example[language][0]}</p>}
            </div>
          ) : (
            <div className="tiles-felt machi-felt" key={entry.title.es}>
              <div className="machi-name"><b>{entry.title[language]}</b><span>{entry.glyph}</span></div>
              {entry.value && <div className="machi-name"><span className="yaku-han">{entry.value}</span></div>}
              {entry.tiles.length > 0 ? (
                <div className="machi-block">
                  <small>{ui.example}</small>
                  <div className="machi-row is-small yaku-hand">
                    {entry.tiles.map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt={code} draggable={false} onError={(event) => onFaceError(event, code)} />)}
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
            {(intro ? (['info'] as const) : (['info', 'data'] as const)).map((id) => (
              <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{id === 'info' ? (intro ? copy.short : ui.info) : ui.data}</button>
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
            ) : (
              <>
                <p className="panel-label">{entry.value}</p>
                <h2>{entry.title[language]} <span className="machi-kanji-inline">{entry.glyph}</span></h2>
                {tab === 'info' ? (
                  <>
                    <p>{entry[language]}</p>
                    {entry.note && <ul className="body-list"><li><strong>{ui.note}</strong>: {entry.note}</li></ul>}
                  </>
                ) : (
                  <ul className="body-list"><li><strong>{ui.value}</strong>: {entry.value}</li></ul>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={ui.rail}>
        <button type="button" className={index === 0 ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(0)}>
          <span className="lesson-thumb is-tiles" aria-hidden="true"><b className="dora-thumb">{config.glyph}</b></span>
          <span className="lesson-title"><strong>1. {copy.short}</strong><small>{copy.sub}</small></span>
          <span className="lesson-chev">{chevron}</span>
        </button>
        {config.entries.map((item, i) => (
          <button type="button" key={item.title.es} className={i + 1 === index ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(i + 1)}>
            <span className="lesson-thumb is-tiles" aria-hidden="true">
              {item.tiles.length ? item.tiles.slice(0, 3).map((code, k) => <img key={`${code}-${k}`} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} />) : <b className="dora-thumb">{item.glyph}</b>}
            </span>
            <span className="lesson-title"><strong>{i + 2}. {item.title[language]}</strong><small>{item.value}</small></span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
