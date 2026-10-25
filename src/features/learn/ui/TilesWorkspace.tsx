import { useCallback, useEffect, useRef, useState } from 'react';
import { TILE_COPY, type TileLang } from '../domain/tilesCopy';

type Family = { id: string; tiles: string[] };
const FAMILIES: Family[] = [
  { id: 'manzu', tiles: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'] },
  { id: 'pinzu', tiles: ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'] },
  { id: 'souzu', tiles: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s'] },
  { id: 'honors', tiles: ['1z', '2z', '3z', '4z', '5z', '6z', '7z'] },
  { id: 'aka', tiles: ['0m', '0p', '0s'] },
];
const FACE_DIR: Record<string, string> = {
  light: 'tiles-fluffystuff-composite', dark: 'tiles-neon', cute: 'tiles-cute', samurai: 'tiles-samurai',
  cyberpunk: 'tiles-cyberpunk', vaquero: 'tiles-vaquero', frutiger: 'tiles-frutiger', fox: 'tiles-fox',
};
const FALLBACK_DIR = 'tiles-fluffystuff-composite';

const UI = {
  es: { tile: 'Ficha', family: 'Familia', step: 'Familia', of: 'de', arrows: 'usa las flechas', quiz: 'Practicar: ¿qué ficha es?', quizHint: 'Reconoce las 34 fichas con ejercicios', rail: 'Familias de fichas', back: 'Anterior', next: 'Siguiente', pick: 'Toca una ficha para conocerla' },
  en: { tile: 'Tile', family: 'Family', step: 'Family', of: 'of', arrows: 'use the arrows', quiz: 'Practise: which tile is it?', quizHint: 'Recognise the 34 tiles with exercises', rail: 'Tile families', back: 'Previous', next: 'Next', pick: 'Tap a tile to meet it' },
  pt: { tile: 'Peça', family: 'Família', step: 'Família', of: 'de', arrows: 'use as setas', quiz: 'Praticar: que peça é?', quizHint: 'Reconheça as 34 peças com exercícios', rail: 'Famílias de peças', back: 'Anterior', next: 'Próxima', pick: 'Toque numa peça para conhecê-la' },
};

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

function initialLanguage(): TileLang {
  const saved = localStorage.getItem('rincon-riichi-language');
  return saved === 'en' || saved === 'pt' ? saved : 'es';
}

const themeNow = () => document.documentElement.getAttribute('data-theme') || 'light';

/** The tile guide, laid out like the tutorial: a stage, an inspector and a rail with one stop per tile family. */
export function TilesWorkspace() {
  const [language, setLanguage] = useState<TileLang>(initialLanguage);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [tab, setTab] = useState<'tile' | 'family'>('tile');
  const [theme, setTheme] = useState(themeNow);
  const railRef = useRef<HTMLElement>(null);
  const copy = TILE_COPY[language];
  const ui = UI[language];
  const family = FAMILIES[index];
  const info = copy.families[family.id];
  const tile = picked && family.tiles.includes(picked) ? picked : family.tiles[0];

  const face = (code: string) => `../assets/${FACE_DIR[theme] ?? FALLBACK_DIR}/${code}.svg`;
  const onFaceError = (event: { currentTarget: HTMLImageElement }, code: string) => {
    const img = event.currentTarget;
    if (!img.src.includes(FALLBACK_DIR)) img.src = `../assets/${FALLBACK_DIR}/${code}.svg`;
  };

  const label = (code: string, familyId: string) => {
    const names = copy.tileNames;
    const number = code[0] === '0' ? '5' : code[0];
    if (familyId === 'manzu') return `${number} ${names.manzu}`;
    if (familyId === 'pinzu') return `${number} ${names.pinzu}`;
    if (familyId === 'souzu') return `${number} ${names.souzu}`;
    if (familyId === 'aka') return code === '0m' ? names.redFiveManzu : code === '0p' ? names.redFivePinzu : names.redFiveSouzu;
    return { '1z': names.east, '2z': names.south, '3z': names.west, '4z': names.north, '5z': names.green, '6z': names.red, '7z': names.white }[code] ?? code;
  };
  const factKey = (code: string) => (code[0] === '0' ? `a0${code[1]}` : `${code[1]}${code[0]}`);

  const open = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(FAMILIES.length - 1, next)));
    setPicked(null);
    setTab('tile');
  }, []);

  // page chrome that still lives outside React: language select, back label and theme picker
  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('#languageSelect');
    if (!select) return undefined;
    select.value = language;
    const back = document.querySelector<HTMLElement>('[data-i18n="back"]');
    const languageLabel = document.querySelector<HTMLElement>('[data-i18n="language"]');
    if (back) back.textContent = { es: '← Volver', en: '← Back', pt: '← Voltar' }[language];
    if (languageLabel) languageLabel.textContent = { es: 'Idioma', en: 'Language', pt: 'Idioma' }[language];
    const onChange = () => {
      const next = select.value as TileLang;
      if (next === 'es' || next === 'en' || next === 'pt') { localStorage.setItem('rincon-riichi-language', next); setLanguage(next); }
    };
    select.addEventListener('change', onChange);
    return () => select.removeEventListener('change', onChange);
  }, [language]);

  useEffect(() => {
    const radios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="theme"]'));
    const stored = localStorage.getItem('theme');
    const themes = Object.keys(FACE_DIR);
    const initial = stored && themes.includes(stored) ? stored : 'light';
    const apply = (next: string) => {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      radios.forEach((radio) => { radio.checked = radio.value === next; });
      setTheme(next);
    };
    const listeners = radios.map((radio) => {
      const onChange = () => { if (radio.checked) apply(radio.value); };
      radio.addEventListener('change', onChange);
      return { radio, onChange };
    });
    apply(initial);
    return () => listeners.forEach(({ radio, onChange }) => radio.removeEventListener('change', onChange));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === 'ArrowLeft') open(index - 1);
      if (event.key === 'ArrowRight') open(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, open]);

  const facts = copy.tileFacts[factKey(tile)];
  return (
    <section className="table-explorer tutorial-lab tiles-lab" aria-label={copy.title}>
      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label={info.title}>
          <div className="explorer-progress">
            <span>{info.tab}</span>
            <strong>{index + 1}/{FAMILIES.length}</strong>
            <div aria-hidden="true"><i style={{ width: `${((index + 1) / FAMILIES.length) * 100}%` }} /></div>
          </div>

          <div className="tiles-felt">
            <div className={`tiles-grid is-${family.id}`}>
              {family.tiles.map((code) => (
                <button type="button" key={code} className={`tiles-tile${code === tile ? ' is-picked' : ''}`} onClick={() => { setPicked(code); setTab('tile'); }} aria-label={label(code, family.id)} aria-pressed={code === tile}>
                  <img src={face(code)} alt="" draggable={false} onError={(event) => onFaceError(event, code)} />
                  <span>{label(code, family.id)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="explorer-stage-controls" aria-label={ui.rail}>
            <button type="button" onClick={() => open(index - 1)} aria-label={ui.back} disabled={index === 0}>←</button>
            <span>{ui.step} {index + 1} {ui.of} {FAMILIES.length} · {ui.arrows}</span>
            <button type="button" onClick={() => open(index + 1)} aria-label={ui.next} disabled={index === FAMILIES.length - 1}>→</button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" role="tablist">
            {(['tile', 'family'] as const).map((id) => (
              <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{id === 'tile' ? ui.tile : ui.family}</button>
            ))}
          </nav>
          <div className="explorer-inspector-copy">
            <p className="panel-label">{info.title}</p>
            {tab === 'tile' ? (
              <>
                <div className="tiles-pick">
                  <img src={face(tile)} alt={label(tile, family.id)} onError={(event) => onFaceError(event, tile)} />
                  <h2>{label(tile, family.id)}</h2>
                </div>
                {facts ? (
                  <>
                    <p>{facts.fact}</p>
                    <ul className="body-list"><li><strong>{copy.tipLabel}</strong>: {facts.mnemonic}</li></ul>
                  </>
                ) : <p>{ui.pick}</p>}
              </>
            ) : (
              <>
                <h2>{info.title}</h2>
                <p>{info.desc}</p>
                <ul className="body-list"><li>{info.tip}</li></ul>
              </>
            )}
            <div className="yaku-controls">
              <a className="sort-button is-primary" href="../practicar/que-ficha-es.html">{ui.quiz} →</a>
            </div>
          </div>
        </aside>
      </div>

      <nav className="explorer-lesson-rail tutorial-rail" ref={railRef} aria-label={ui.rail}>
        {FAMILIES.map((item, itemIndex) => (
          <button type="button" key={item.id} className={itemIndex === index ? 'is-active is-part-discover' : 'is-part-discover'} onClick={() => open(itemIndex)}>
            <span className="lesson-thumb is-tiles" aria-hidden="true">
              {item.tiles.slice(0, 3).map((code, i) => <img key={code} src={face(code)} alt="" onError={(event) => onFaceError(event, code)} style={{ transform: `translateY(${i === 1 ? -3 : 2}px)` }} />)}
            </span>
            <span className="lesson-title">
              <strong>{itemIndex + 1}. {copy.families[item.id].tab}</strong>
              <small>{item.tiles.length} {ui.tile.toLowerCase()}{language === 'es' ? 's' : 's'}</small>
            </span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
