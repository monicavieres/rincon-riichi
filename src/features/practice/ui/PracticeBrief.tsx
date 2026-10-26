import { useEffect, useState } from 'react';
import { BRIEFS, BRIEF_CHIPS, BRIEF_UI } from '../domain/practiceBriefs';
import type { PracticeKey } from '../domain/practiceCatalog';

type Lang = 'es' | 'en' | 'pt';
const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK = 'tiles-fluffystuff-composite';
const FAMILIES = [
  ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'],
  ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'],
  ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s'],
  ['1z', '2z', '3z', '4z', '5z', '6z', '7z'],
];

function useSiteSettings() {
  const read = (): Lang => { const saved = localStorage.getItem('rincon-riichi-language'); return saved === 'en' || saved === 'pt' ? saved : 'es'; };
  const [language, setLanguage] = useState<Lang>(read);
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    const onChange = () => { const next = select?.value; if (next === 'es' || next === 'en' || next === 'pt') setLanguage(next); };
    select?.addEventListener('change', onChange);
    const watcher = new MutationObserver(() => setTheme(document.documentElement.getAttribute('data-theme') || 'light'));
    watcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { select?.removeEventListener('change', onChange); watcher.disconnect(); };
  }, []);
  return { language, theme };
}

/** The start screen's stage: what the drill trains, with an example, instead of a mascot. */
const MODE_FILTERS: Array<(code: string) => boolean> = [
  () => true,
  (code) => code.endsWith('m'),
  (code) => code.endsWith('p'),
  (code) => code.endsWith('s'),
  (code) => code.endsWith('z'),
  (code) => code.endsWith('m') || code.endsWith('z'),
  (code) => !code.endsWith('z'),
];

export function PracticeBrief({ kind, title, subtitle, i18n = true }: { kind: PracticeKey; title: string; subtitle: string; i18n?: boolean }) {
  const [focus, setFocus] = useState<number | null>(null);
  const { language, theme } = useSiteSettings();
  const brief = BRIEFS[kind];
  const ui = BRIEF_UI[language];
  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK}/${code}.svg`;
  const onError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK)) img.src = `../assets/${FALLBACK}/${code}.svg`;
  };
  const tile = (code: string, gold = false) => <img key={`${code}-${gold}`} className={gold ? 'is-gold' : undefined} src={face(code)} alt={code} draggable={false} onError={(event) => onError(event, code)} />;

  const keyed = (name: string) => (i18n ? name : undefined);
  const modeOf = (event: { target: EventTarget }) => {
    const button = (event.target as HTMLElement).closest('.tile-mode');
    if (!button || !button.parentElement) return null;
    return Array.from(button.parentElement.children).indexOf(button);
  };

  return (
    <div className="tiles-felt practice-brief practice-start-felt">
      <h1 id="startTitle" data-i18n={keyed(kind === 'tileName' ? 'tileStart.title' : 'title')}>{title}</h1>
      <p className="start-sub" id="startSubtitle" data-i18n={keyed(kind === 'tileName' ? 'tileStart.subtitle' : 'subtitle')}>{subtitle}</p>
      {kind === 'tileName' ? (
        <div className="brief-atlas">
          {FAMILIES.map((family, i) => (
            <div className="brief-family" key={ui.families[i]}>
              <small>{ui.families[i]}</small>
              <div className="machi-row is-small">{family.map((code) => (
                <img key={code} className={focus !== null && !MODE_FILTERS[focus](code) ? 'is-dim' : undefined} src={face(code)} alt={code} draggable={false} onError={(event) => onError(event, code)} />
              ))}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {brief.tiles.length > 0 && (
            <div className="machi-block">
              <div className="machi-row is-small yaku-hand">
                {brief.tiles.map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt={code} draggable={false} onError={(event) => onError(event, code)} />)}
                {brief.gold?.map((code) => tile(code, true))}
              </div>
            </div>
          )}
          <ol className="brief-steps">{brief.steps.map((step, i) => <li key={i}><b>{i + 1}</b><span>{step[language]}</span></li>)}</ol>
        </>
      )}
      <div className="brief-controls" onMouseOver={(event) => { const index = modeOf(event); if (index !== null) setFocus(index); }} onMouseLeave={() => setFocus(null)}>
        {kind === 'tileName' ? <div className="tile-modes" id="tileModes" /> : <button className="big-button green start-button" id="startButton" data-i18n={keyed('start')}>Empezar</button>}
      </div>
      <div className="tile-start-chips" aria-hidden="true">{BRIEF_CHIPS[language].map((chip) => <span key={chip}>{chip}</span>)}</div>
    </div>
  );
}
