import { useEffect, useRef, useState } from 'react';
import { themeById, themes } from '../theme/themes';

/** Follows data-theme on <html>, which js/menu.js sets from the radios below and from localStorage. */
function useDataTheme() {
  const read = () => document.documentElement.getAttribute('data-theme');
  const [theme, setTheme] = useState<string | null>(() => {
    try {
      return read() || localStorage.getItem('theme');
    } catch {
      return read();
    }
  });

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * One button with the current style's emblem; it opens a panel of cards, one per style.
 * The cards are real radios named "theme": js/menu.js listens to them, so they are always rendered.
 */
export function ThemePicker({ assetBase }: { assetBase: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = themeById(useDataTheme());

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`theme-picker${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="theme-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="theme-panel"
        title={`Estilo: ${current.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <img src={`${assetBase}assets/${current.emblem}`} alt="" draggable={false} />
        <span className="side-rail-label">Estilo · {current.name}</span>
      </button>

      <div className="theme-panel" id="theme-panel" role="radiogroup" aria-label="Estilo del sitio" hidden={!open}>
        <p className="theme-panel-title">Elige un estilo</p>
        <div className="theme-grid">
          {themes.map((theme) => (
            <label className="theme-card" key={theme.id} title={`${theme.name} · ${theme.mood}`}>
              <input type="radio" name="theme" value={theme.id} aria-label={`Estilo ${theme.name}`} onChange={() => setOpen(false)} />
              <img src={`${assetBase}assets/${theme.emblem}`} alt="" draggable={false} />
              <b>{theme.name}</b>
              <small>{theme.mood}</small>
              <span className="theme-swatches" aria-hidden="true">
                {theme.swatches.map((color) => <i key={color} style={{ background: color }} />)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
