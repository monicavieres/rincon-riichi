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
 * One palette button; it opens a painter's palette with a dab of paint per style.
 * The cards are real radios named "theme": js/menu.js listens to them, so they are always rendered.
 */
/** Where each dab of paint sits on the palette (percent of its box) and how it is tilted. */
const DAB_AT: Array<[number, number, number]> = [
  [21, 40, -8], [39, 21, 6], [60, 17, -4], [80, 31, 9], [86, 57, -6], [71, 78, 5], [49, 70, -9], [53, 44, 7],
];

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
        <svg className="palette-icon" viewBox="0 0 32 32" aria-hidden="true">
          <path className="palette-body" d="M16 3.500C8.300 3.500 2.500 8.800 2.500 15.800 2.500 22.500 7.800 28 14.200 28c2.300 0 3.400-1.100 3.400-2.600 0-1.900-1.600-2.200-1.600-3.900 0-1.500 1.200-2.400 2.800-2.400h4.200c4.200 0 7.500-2.900 7.500-6.800C29 7.400 23.500 3.500 16 3.500z" />
          <circle cx="9" cy="13" r="2.600" fill={current.swatches[0]} />
          <circle cx="14" cy="8.500" r="2.600" fill={current.swatches[1]} />
          <circle cx="21" cy="9" r="2.600" fill={current.swatches[2]} />
          <circle cx="9.500" cy="20" r="2.600" fill={current.swatches[1]} />
          <circle cx="17" cy="23.500" r="1.800" className="palette-hole" />
        </svg>
        <span className="side-rail-label">Estilo · {current.name}</span>
      </button>

      <div className="theme-panel" id="theme-panel" role="radiogroup" aria-label="Estilo del sitio" hidden={!open}>
        <div className="paint-palette">
          <svg className="paint-board" viewBox="0 0 320 240" aria-hidden="true" preserveAspectRatio="none">
            <path d="M58 122C22 74 66 14 160 12c92-2 148 48 146 108-2 54-52 82-90 78-30-3-40 18-66 26C106 238 50 214 58 122Z" />
            <ellipse cx="98" cy="170" rx="17" ry="14" className="paint-hole" />
          </svg>
          {themes.map((theme, index) => (
            <label
              className="paint-dab"
              key={theme.id}
              title={`${theme.name} · ${theme.mood}`}
              style={{ left: `${DAB_AT[index][0]}%`, top: `${DAB_AT[index][1]}%`, ['--c1' as string]: theme.swatches[1], ['--c2' as string]: theme.swatches[2], ['--c3' as string]: theme.swatches[0], ['--tilt' as string]: `${DAB_AT[index][2]}deg` }}
            >
              <input type="radio" name="theme" value={theme.id} aria-label={`Estilo ${theme.name}`} onChange={() => setOpen(false)} />
              <i aria-hidden="true" />
              <small>{theme.name}</small>
            </label>
          ))}
        </div>
        <p className="paint-caption"><b>{current.name}</b> · {current.mood}</p>
      </div>
    </div>
  );
}
