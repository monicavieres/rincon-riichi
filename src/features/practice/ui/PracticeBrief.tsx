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
export function PracticeBrief({ kind }: { kind: PracticeKey }) {
  const { language, theme } = useSiteSettings();
  const brief = BRIEFS[kind];
  const ui = BRIEF_UI[language];
  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK}/${code}.svg`;
  const onError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK)) img.src = `../assets/${FALLBACK}/${code}.svg`;
  };
  const tile = (code: string, gold = false) => <img key={`${code}-${gold}`} className={gold ? 'is-gold' : undefined} src={face(code)} alt={code} draggable={false} onError={(event) => onError(event, code)} />;

  return (
    <div className="tiles-felt practice-brief">
      <div className="machi-name"><b>{kind === 'tileName' ? ui.atlas : brief.goal[language]}</b></div>
      {kind === 'tileName' ? (
        <div className="brief-atlas">
          {FAMILIES.map((family, i) => (
            <div className="brief-family" key={ui.families[i]}>
              <small>{ui.families[i]}</small>
              <div className="machi-row is-small">{family.map((code) => tile(code))}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {brief.tiles.length > 0 && (
            <div className="machi-block">
              <small>{ui.example}</small>
              <div className="machi-row is-small yaku-hand">
                {brief.tiles.map((code, i) => <img key={`${code}-${i}`} src={face(code)} alt={code} draggable={false} onError={(event) => onError(event, code)} />)}
                {brief.gold?.map((code) => tile(code, true))}
              </div>
            </div>
          )}
          <ol className="brief-steps">{brief.steps.map((step, i) => <li key={i}><b>{i + 1}</b><span>{step[language]}</span></li>)}</ol>
        </>
      )}
      <div className="tile-start-chips" aria-hidden="true">{BRIEF_CHIPS[language].map((chip) => <span key={chip}>{chip}</span>)}</div>
    </div>
  );
}
