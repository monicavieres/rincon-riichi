import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { initialLanguage, usePageChrome } from '../ui/usePageChrome';
import { tilePath } from '../ui/stages/SortBoard';
import { TILE_BACK } from '../ui/stages/DeckBoard';
import { withTiles } from '../ui/stages/TileText';

/**
 * Shared pieces for the three full-screen tutorial demos: language and theme, tiles, cats, the narrator voice and
 * small helpers. Tile codes written inside a sentence ("4p 5p 6p") become tile pictures, never letters on screen.
 */

export type Lang = 'es' | 'en' | 'pt';
export type Tx = Record<Lang, string>;
export const L = (es: string, en: string, pt: string): Tx => ({ es, en, pt });

const THEMES = ['light', 'dark', 'cute', 'samurai', 'cyberpunk', 'vaquero', 'frutiger', 'fox'];

/** Language, theme and a translator, kept in step with the side rail. */
export function useDemo() {
  const [language, setLanguage] = useState<Lang>(initialLanguage);
  const rawTheme = usePageChrome(language, setLanguage);
  const theme = THEMES.includes(rawTheme) ? rawTheme : 'light';
  const t = useCallback((value: Tx) => value[language] ?? value.es, [language]);
  return { language, theme, t };
}

export type Fur = 'white' | 'orange' | 'grey' | 'black';
export type Expr = 'calm' | 'excited' | 'happy' | 'nervous' | 'sad' | 'sleepy' | 'smile' | 'surprised' | 'thinking' | 'wink';
const SIDE_EXPR: Expr[] = ['calm', 'happy', 'excited'];

export const catSrc = (theme: string, fur: Fur, expr: Expr = 'calm', side = false) => {
  const face = side && !SIDE_EXPR.includes(expr) ? 'calm' : expr;
  return `../assets/illustrations/cats/${theme}-${fur}${side ? '-side' : ''}-${face}.svg`;
};

/** One of the site's hand-drawn kittens, drawn in the current theme. */
export function Cat({ theme, fur, expr = 'calm', side = false, mirror = false, className = '', style }: { theme: string; fur: Fur; expr?: Expr; side?: boolean; mirror?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <img
      className={`demo-cat${side ? ' is-side' : ''}${mirror ? ' is-mirror' : ''} ${className}`}
      src={catSrc(theme, fur, expr, side)}
      alt=""
      draggable={false}
      style={style}
    />
  );
}

/** A tile picture. With `onClick` it becomes a button. */
export function Tile({ code, back = false, className = '', style, onClick, label, disabled }: { code?: string; back?: boolean; className?: string; style?: CSSProperties; onClick?: () => void; label?: string; disabled?: boolean }) {
  const src = back || !code ? TILE_BACK : tilePath(code);
  const img = <img src={src} alt={onClick ? '' : (label ?? '')} draggable={false} />;
  if (!onClick) return <span className={`demo-tile ${className}`} style={style}>{img}</span>;
  return <button type="button" className={`demo-tile is-button ${className}`} style={style} onClick={onClick} aria-label={label ?? code} disabled={disabled}>{img}</button>;
}

/** A row of tiles from a list of codes. Spaces in a string list group them: "1m 2m 3m | 4p 4p". */
export function TileRow({ codes, className = '' }: { codes: string[]; className?: string }) {
  return (
    <span className={`demo-row ${className}`}>
      {codes.map((code, i) => (code === '|' ? <i key={i} className="demo-gap" /> : <Tile key={i} code={code} />))}
    </span>
  );
}

export const codes = (text: string) => text.trim().split(/\s+/);

/** **word** is highlighted; tile codes become tile pictures. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{withTiles(part)}</strong> : <span key={i}>{withTiles(part)}</span>))}
    </>
  );
}

/* ── The narrator voice (the browser's own speech, off unless the person turns it on) ───────────── */

const SUIT_NAME: Record<Lang, Record<string, string>> = {
  es: { m: 'de caracteres', p: 'de círculos', s: 'de bambú' },
  en: { m: 'of characters', p: 'of circles', s: 'of bamboo' },
  pt: { m: 'de caracteres', p: 'de círculos', s: 'de bambu' },
};
const HONOR_NAME: Record<Lang, string[]> = {
  es: ['Este', 'Sur', 'Oeste', 'Norte', 'dragón verde', 'dragón rojo', 'dragón blanco'],
  en: ['East', 'South', 'West', 'North', 'green dragon', 'red dragon', 'white dragon'],
  pt: ['Leste', 'Sul', 'Oeste', 'Norte', 'dragão verde', 'dragão vermelho', 'dragão branco'],
};

/** How a tile is said out loud: "4p" → "4 de círculos". */
export const sayTile = (code: string, language: Lang) => (code[1] === 'z'
  ? HONOR_NAME[language][Number(code[0]) - 1]
  : `${code[0] === '0' ? '5' : code[0]} ${SUIT_NAME[language][code[1]]}`);

const spoken = (text: string, language: Lang) => text
  .replace(/\*\*/g, '')
  .replace(/(?<![\w])([0-9][mpsz])(?![\w])/g, (_, code: string) => sayTile(code, language))
  .replace(/[«»“”]/g, '');

const VOICE_KEY = 'rincon-riichi-demo-voice';
const VOICE_LANG: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };

/** Reads text aloud when the voice is on. The choice is remembered per viewer. */
export function useVoice(language: Lang, rate = 0.98) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [on, setOn] = useState(() => { try { return localStorage.getItem(VOICE_KEY) === 'on'; } catch { return false; } });
  const say = useCallback((text: string, force = false) => {
    if (!supported || (!on && !force)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const line = new SpeechSynthesisUtterance(spoken(text, language));
    line.lang = VOICE_LANG[language];
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(language));
    if (voice) line.voice = voice;
    line.rate = rate;
    synth.speak(line);
  }, [language, on, rate, supported]);
  const toggle = useCallback(() => {
    setOn((now) => {
      const next = !now;
      try { localStorage.setItem(VOICE_KEY, next ? 'on' : 'off'); } catch { /* storage may be blocked */ }
      if (!next && supported) window.speechSynthesis.cancel();
      return next;
    });
  }, [supported]);
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  return { on, supported, say, toggle };
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */

/** Saves a small value per viewer (progress, last chapter). It works without storage too. */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be blocked */ } }, [key, value]);
  return [value, setValue] as const;
}

const UI = {
  back: L('Volver a Aprender', 'Back to Learn', 'Voltar para Aprender'),
  full: L('Pantalla completa', 'Full screen', 'Tela cheia'),
  voiceOn: L('Voz activada', 'Voice on', 'Voz ligada'),
  voiceOff: L('Activar voz', 'Turn voice on', 'Ligar voz'),
};

/** The full-screen frame every demo sits in: a slim top bar and the stage. */
export function DemoFrame({ className, title, t, voice, extra, children }: { className: string; title: ReactNode; t: (v: Tx) => string; voice?: ReturnType<typeof useVoice>; extra?: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void root.current?.requestFullscreen?.().catch(() => undefined);
  };
  return (
    <section ref={root} className={`demo ${className}`}>
      <header className="demo-bar">
        <a className="demo-back" href="../index.html#aprender" aria-label={t(UI.back)} title={t(UI.back)}>←</a>
        <div className="demo-title">{title}</div>
        <div className="demo-bar-tools">
          {extra}
          {voice?.supported && (
            <button type="button" className={`demo-icon${voice.on ? ' is-on' : ''}`} onClick={voice.toggle} aria-pressed={voice.on} title={voice.on ? t(UI.voiceOn) : t(UI.voiceOff)} aria-label={voice.on ? t(UI.voiceOn) : t(UI.voiceOff)}>
              {voice.on ? '🔊' : '🔈'}
            </button>
          )}
          <button type="button" className={`demo-icon${full ? ' is-on' : ''}`} onClick={toggleFull} title={t(UI.full)} aria-label={t(UI.full)} aria-pressed={full}>⛶</button>
        </div>
      </header>
      {children}
    </section>
  );
}

/** A short burst of confetti-like tiles when something is solved. */
export function Burst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="demo-burst" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--a': `${(i / 14) * 360}deg`, '--d': `${60 + (i % 3) * 22}px` } as CSSProperties} />)}
    </span>
  );
}

/** Groups of 3 or 2 tiles: is it a sequence, a triplet or a pair? */
export function groupKind(list: string[]): 'sequence' | 'triplet' | 'pair' | null {
  const norm = list.map((c) => (c[0] === '0' ? `5${c[1]}` : c));
  if (norm.length === 2) return norm[0] === norm[1] ? 'pair' : null;
  if (norm.length !== 3) return null;
  if (norm.every((c) => c === norm[0])) return 'triplet';
  const suit = norm[0][1];
  if (suit === 'z' || norm.some((c) => c[1] !== suit)) return null;
  const n = norm.map((c) => Number(c[0])).sort((a, b) => a - b);
  return n[1] === n[0] + 1 && n[2] === n[1] + 1 ? 'sequence' : null;
}

/** The tile that comes after another one, as the dora does: 9 goes back to 1, North to East; dragons run 5z → 6z → 7z → 5z (green, red, white). */
export function nextTile(code: string) {
  const n = Number(code[0] === '0' ? 5 : code[0]);
  const suit = code[1];
  if (suit !== 'z') return `${n === 9 ? 1 : n + 1}${suit}`;
  if (n <= 4) return `${n === 4 ? 1 : n + 1}z`;
  return `${n === 7 ? 5 : n + 1}z`;
}

export const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
