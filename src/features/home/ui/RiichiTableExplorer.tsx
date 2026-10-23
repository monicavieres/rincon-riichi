import { useEffect, useMemo, useRef, useState } from 'react';
import { tableArtPath, tableExplorerStops, type ExplorerTab, type TableArt } from '../domain/tableExplorer';

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

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

export function RiichiTableExplorer() {
  const explorerRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(tableExplorerStops[0].id);
  const [activeTab, setActiveTab] = useState<ExplorerTab>('summary');
  const activeIndex = tableExplorerStops.findIndex((stop) => stop.id === activeId);
  const active = useMemo(
    () => tableExplorerStops[Math.max(activeIndex, 0)],
    [activeIndex],
  );

  const selectStop = (id: string) => {
    setActiveId(id);
    setActiveTab('summary');
  };

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
      <header className="table-explorer-header">
        <div>
          <p className="eyebrow">Mahjong riichi, explicado sobre la mesa</p>
          <h1 id="table-explorer-title">Explora una partida <em>antes de memorizar reglas</em></h1>
          <p>Selecciona un punto. La mesa te mostrará qué es, para qué sirve y dónde puedes practicarlo.</p>
        </div>
        <div className="explorer-progress" aria-label={`Paso ${activeIndex + 1} de ${tableExplorerStops.length}`}>
          <span>Ruta inicial</span>
          <strong>{activeIndex + 1}/{tableExplorerStops.length}</strong>
          <div aria-hidden="true"><i style={{ width: `${((activeIndex + 1) / tableExplorerStops.length) * 100}%` }} /></div>
        </div>
      </header>

      <div className="table-explorer-workspace">
        <div className="table-explorer-stage" aria-label="Mesa de riichi interactiva">
          <div className="table-explorer-visual">
            <ThemedArt art="mesa" alt="Mesa de riichi en perspectiva, con los cuatro muros, la consola de vientos, dados y palitos de puntos" />
            {tableExplorerStops.map((stop, index) => (
              <button
                className={`table-hotspot${active.id === stop.id ? ' is-active' : ''}`}
                key={stop.id}
                type="button"
                style={{ left: `${stop.hotspot.x}%`, top: `${stop.hotspot.y}%` }}
                aria-label={`Explorar: ${stop.shortTitle}`}
                aria-pressed={active.id === stop.id}
                onClick={() => selectStop(stop.id)}
              >
                <span>{index + 1}</span>
                <b>{stop.shortTitle}</b>
              </button>
            ))}
          </div>
          <div className="explorer-stage-controls" aria-label="Navegación de la mesa">
            <button type="button" onClick={() => move(-1)} aria-label="Concepto anterior">←</button>
            <span>También puedes usar las flechas del teclado</span>
            <button type="button" onClick={() => move(1)} aria-label="Concepto siguiente">→</button>
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
            <span className="lesson-thumb"><ThemedArt art={stop.art} /></span>
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
