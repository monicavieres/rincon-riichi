import { useEffect, useMemo, useRef, useState } from 'react';
import { boxOutline, projectToPercent, tableArtPath, tableExplorerStops, type ExplorerTab, type TableArt, type TableExplorerStop } from '../domain/tableExplorer';

const tabs: Array<{ id: ExplorerTab; label: string }> = [
  { id: 'summary', label: 'Resumen' },
  { id: 'observe', label: 'Qué mirar' },
  { id: 'practice', label: 'Pruébalo' },
];

function ThemedArt({ art, className, alt = '' }: { art: TableArt; className?: string; alt?: string }) {
  return (
    <>
      <img className={`rr-only-light${className ? ` ${className}` : ''}`} src={tableArtPath(art, 'light')} alt={alt} />
      <img className={`rr-only-dark${className ? ` ${className}` : ''}`} src={tableArtPath(art, 'dark')} alt="" aria-hidden="true" />
    </>
  );
}

/** Bounding box (in % of the illustration) of a stop's zone. */
function zoneBounds(stop: TableExplorerStop) {
  const outlines = stop.focus.boxes.map(boxOutline);
  const pts = outlines.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { outlines, x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

// Thumbnail = the table itself, framed on the stop's zone, so each card shows exactly what the step is about.
const THUMB = { w: 72, h: 56 };
const TABLE_RATIO = 1055.2 / 694;

function ZoneThumb({ stop }: { stop: TableExplorerStop }) {
  const b = zoneBounds(stop);
  const scale = Math.min((0.86 * 100) / (b.x1 - b.x0), (0.86 * 100 * THUMB.h * TABLE_RATIO) / ((b.y1 - b.y0) * THUMB.w));
  const width = THUMB.w * scale;
  const height = width / TABLE_RATIO;
  const style = {
    width: `${width}px`,
    left: `${THUMB.w / 2 - (b.cx / 100) * width}px`,
    top: `${THUMB.h / 2 - (b.cy / 100) * height}px`,
  };
  return (
    <span className="lesson-thumb" aria-hidden="true">
      <img className="rr-only-light" src={tableArtPath('mesa', 'light')} alt="" style={style} />
      <img className="rr-only-dark" src={tableArtPath('mesa', 'dark')} alt="" style={style} />
    </span>
  );
}

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

export function RiichiTableExplorer() {
  const explorerRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(tableExplorerStops[0].id);
  const [activeTab, setActiveTab] = useState<ExplorerTab>('summary');
  const [overview, setOverview] = useState(false);
  const activeIndex = tableExplorerStops.findIndex((stop) => stop.id === activeId);
  const active = useMemo(
    () => tableExplorerStops[Math.max(activeIndex, 0)],
    [activeIndex],
  );

  const selectStop = (id: string) => {
    setActiveId(id);
    setActiveTab('summary');
    setOverview(false);
  };

  // Camera: zoom into the active stop's zone, centred on it and kept inside the picture.
  const camera = useMemo(() => {
    const { outlines, cx, cy } = zoneBounds(active);
    const zoom = overview ? 1 : active.focus.zoom;
    const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * zoom, v));
    return { outlines, zoom, tx: clamp(50 - cx * zoom), ty: clamp(50 - cy * zoom) };
  }, [active, overview]);
  const zoomed = camera.zoom > 1;

  const move = (direction: number) => {
    const next = (activeIndex + direction + tableExplorerStops.length) % tableExplorerStops.length;
    selectStop(tableExplorerStops[next].id);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;

      const bounds = explorerRef.current?.getBoundingClientRect();
      const explorerIsActive = bounds && bounds.top < window.innerHeight * 0.72 && bounds.bottom > window.innerHeight * 0.28;
      if (!explorerIsActive) return;

      event.preventDefault();
      event.stopPropagation();
      move(event.key === 'ArrowRight' ? 1 : -1);
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [activeIndex]);

  return (
    <section className="table-explorer" aria-labelledby="table-explorer-title" ref={explorerRef}>

      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label="Mesa de riichi interactiva">
          <div className="explorer-progress" aria-label={`Paso ${activeIndex + 1} de ${tableExplorerStops.length}`}>
            <span>Ruta inicial</span>
            <strong>{activeIndex + 1}/{tableExplorerStops.length}</strong>
            <div aria-hidden="true"><i style={{ width: `${((activeIndex + 1) / tableExplorerStops.length) * 100}%` }} /></div>
          </div>
          <div className={`table-explorer-tilt${zoomed ? ' is-zoomed' : ''}`}>
            <div
              className="table-explorer-visual"
              style={{
                transform: `translate(${camera.tx}%, ${camera.ty}%) scale(${camera.zoom})`,
                ['--inv-zoom' as string]: 1 / camera.zoom,
              }}
            >
              <ThemedArt art="mesa" alt="Mesa de riichi en perspectiva, con los cuatro muros, las manos de cada jugador, los descartes en filas de seis y la consola de vientos" />
              <svg className="table-spotlight" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <mask id="table-spotlight-mask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    {camera.outlines.map((outline, i) => <polygon key={i} points={outline.map((p) => p.join(',')).join(' ')} fill="black" />)}
                  </mask>
                </defs>
                <rect className={`table-spotlight-dim${zoomed ? ' is-on' : ''}`} x="0" y="0" width="100" height="100" mask="url(#table-spotlight-mask)" />
                {camera.outlines.map((outline, i) => (
                  <polygon key={`${active.id}-${i}`} className="table-spotlight-edge" points={outline.map((p) => p.join(',')).join(' ')} />
                ))}
              </svg>
              {tableExplorerStops.map((stop, index) => {
                const [x, y] = projectToPercent(stop.hotspot);
                return (
                  <button
                    className={`table-hotspot${active.id === stop.id ? ' is-active' : ''}`}
                    key={stop.id}
                    type="button"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={`Explorar: ${stop.shortTitle}`}
                    aria-pressed={active.id === stop.id}
                    onClick={() => selectStop(stop.id)}
                  >
                    <span>{index + 1}</span>
                    <b>{stop.shortTitle}</b>
                  </button>
                );
              })}
              {active.callouts.map((callout, index) => {
                const [x, y] = projectToPercent(callout.at);
                const length = Math.hypot(callout.dx, callout.dy);
                const angle = (Math.atan2(callout.dy, callout.dx) * 180) / Math.PI;
                return (
                  <span
                    className={`table-callout${callout.dx < 0 ? ' is-left' : ''}`}
                    key={`${active.id}-${callout.label}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      ['--delay' as string]: `${0.5 + index * 0.1}s`,
                      ['--dx' as string]: `${callout.dx}px`,
                      ['--dy' as string]: `${callout.dy}px`,
                    }}
                  >
                    <i className="table-callout-dot" />
                    <i className="table-callout-line" style={{ width: `calc(${length}px * var(--leader, 1))`, transform: `rotate(${angle}deg)` }} />
                    <b className="table-callout-label">{callout.label}</b>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="explorer-stage-controls" aria-label="Navegación de la mesa">
            <button type="button" onClick={() => move(-1)} aria-label="Concepto anterior">←</button>
            <span>Paso {activeIndex + 1} de {tableExplorerStops.length} · usa las flechas</span>
            <button type="button" onClick={() => move(1)} aria-label="Concepto siguiente">→</button>
            <i aria-hidden="true" />
            <button
              type="button"
              className={overview ? 'is-on' : ''}
              onClick={() => setOverview((value) => !value)}
              aria-pressed={overview}
              aria-label={overview ? 'Acercar a la zona' : 'Ver la mesa completa'}
              title={overview ? 'Acercar a la zona' : 'Ver la mesa completa'}
              disabled={active.focus.zoom === 1}
            >
              {overview ? '+' : '⤢'}
            </button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" aria-label="Detalle del concepto" role="tablist">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={activeTab === tab.id ? 'is-active' : ''}
                aria-selected={activeTab === tab.id}
                role="tab"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="explorer-inspector-copy">
            <p className="panel-label">{active.eyebrow}</p>
            <h2>{active.title}</h2>
            {activeTab === 'summary' && <p>{active.description}</p>}
            {activeTab === 'observe' && (
              <ul>{active.observe.map((point) => <li key={point}>{point}</li>)}</ul>
            )}
            {activeTab === 'practice' && (
              <div className="explorer-practice">
                <p>{active.practicePrompt}</p>
                <a href={active.route}>{active.actionLabel} <span aria-hidden="true">→</span></a>
              </div>
            )}
          </div>

          <div className="explorer-inspector-footer">
            <span aria-hidden="true">雀</span>
            <p><strong>Sin presión:</strong> toca los puntos en cualquier orden.</p>
          </div>
        </aside>
      </div>

      <h2 className="explorer-lesson-heading">Lecciones de la mesa</h2>
      <nav className="explorer-lesson-rail" aria-label="Conceptos de la mesa">
        {tableExplorerStops.map((stop, index) => (
          <button
            type="button"
            key={stop.id}
            className={active.id === stop.id ? 'is-active' : ''}
            onClick={() => selectStop(stop.id)}
          >
            <ZoneThumb stop={stop} />
            <span className="lesson-title">
              <strong>{index + 1}. {stop.shortTitle}</strong>
              <small>{stop.eyebrow}</small>
            </span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
