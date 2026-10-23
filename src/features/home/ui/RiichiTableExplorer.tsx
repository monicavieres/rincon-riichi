import { useEffect, useMemo, useRef, useState } from 'react';
import { TableStage, ZoneThumb } from '../../../shared/ui/TableStage';
import { tableExplorerStops, type ExplorerTab } from '../domain/tableExplorer';

const tabs: Array<{ id: ExplorerTab; label: string }> = [
  { id: 'summary', label: 'Resumen' },
  { id: 'observe', label: 'Qué mirar' },
  { id: 'practice', label: 'Pruébalo' },
];

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

export function RiichiTableExplorer() {
  const explorerRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    const rail = railRef.current;
    const activeItem = rail?.children[activeIndex] as HTMLElement | undefined;
    if (!rail || !activeItem) return;
    const railBox = rail.getBoundingClientRect();
    const activeBox = activeItem.getBoundingClientRect();
    const padding = 12;
    if (activeBox.left >= railBox.left + padding && activeBox.right <= railBox.right - padding) return;
    const target = rail.scrollLeft + (activeBox.left - railBox.left) - (rail.clientWidth - activeBox.width) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
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
          <TableStage
            focus={active.focus}
            callouts={active.callouts}
            stepKey={active.id}
            overview={overview}
            hotspots={tableExplorerStops.map((stop) => ({ id: stop.id, label: stop.shortTitle, at: stop.hotspot }))}
            activeHotspot={active.id}
            onHotspot={selectStop}
            hotspotAria={(label) => `Explorar: ${label}`}
            alt="Mesa de riichi en perspectiva, con los cuatro muros, las manos de cada jugador, los descartes en filas de seis y el compass de vientos"
          />
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
      <nav className="explorer-lesson-rail" ref={railRef} aria-label="Conceptos de la mesa">
        {tableExplorerStops.map((stop, index) => (
          <button
            type="button"
            key={stop.id}
            className={active.id === stop.id ? 'is-active' : ''}
            onClick={() => selectStop(stop.id)}
          >
            <ZoneThumb focus={stop.focus} />
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
