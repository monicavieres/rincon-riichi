import { useEffect, useMemo, useRef, useState } from 'react';
import { TableStage, ZoneThumb } from '../../../shared/ui/TableStage';
import { tableExplorerStops as baseStops, type ExplorerTab } from '../domain/tableExplorer';
import { explorerText as t, stopCopy } from '../domain/tableExplorerCopy';
import { pick, useLanguage, type Language } from '../../../shared/i18n/useLanguage';

const tabIds: ExplorerTab[] = ['summary', 'observe', 'practice'];

/** The stops with their wording in the chosen language; geometry never changes. */
const localizeStops = (language: Language) => {
  if (language === 'es') return baseStops;
  const copy = stopCopy[language];
  return baseStops.map((stop) => {
    const text = copy[stop.id];
    if (!text) return stop;
    return {
      ...stop,
      ...text,
      callouts: stop.callouts.map((callout, index) => ({ ...callout, label: text.callouts[index] ?? callout.label })),
    };
  });
};

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

export function RiichiTableExplorer() {
  const language = useLanguage();
  const tableExplorerStops = useMemo(() => localizeStops(language), [language]);
  const explorerRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(tableExplorerStops[0].id);
  const [activeTab, setActiveTab] = useState<ExplorerTab>('summary');
  const [overview, setOverview] = useState(false);
  const activeIndex = tableExplorerStops.findIndex((stop) => stop.id === activeId);
  const active = useMemo(
    () => tableExplorerStops[Math.max(activeIndex, 0)],
    [activeIndex, tableExplorerStops],
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
        <div className="table-explorer-stage" aria-label={pick(t.stageLabel, language)}>
          <div className="explorer-progress" aria-label={`${pick(t.step, language)} ${activeIndex + 1} ${pick(t.of, language)} ${tableExplorerStops.length}`}>
            <span>{pick(t.route, language)}</span>
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
            hotspotAria={(label) => `${pick(t.explore, language)}: ${label}`}
            alt={pick(t.alt, language)}
          />
          <div className="explorer-stage-controls" aria-label={pick(t.stageLabel, language)}>
            <button type="button" onClick={() => move(-1)} aria-label={pick(t.prev, language)}>←</button>
            <span>{pick(t.step, language)} {activeIndex + 1} {pick(t.of, language)} {tableExplorerStops.length} · {pick(t.arrows, language)}</span>
            <button type="button" onClick={() => move(1)} aria-label={pick(t.next, language)}>→</button>
            <i aria-hidden="true" />
            <button
              type="button"
              className={overview ? 'is-on' : ''}
              onClick={() => setOverview((value) => !value)}
              aria-pressed={overview}
              aria-label={pick(overview ? t.zoom : t.full, language)}
              title={pick(overview ? t.zoom : t.full, language)}
              disabled={active.focus.zoom === 1}
            >
              {overview ? '+' : '⤢'}
            </button>
          </div>
        </div>

        <aside className="table-explorer-inspector" aria-live="polite">
          <nav className="explorer-tabs" aria-label={pick(t.stageLabel, language)} role="tablist">
            {tabIds.map((id) => (
              <button
                type="button"
                key={id}
                className={activeTab === id ? 'is-active' : ''}
                aria-selected={activeTab === id}
                role="tab"
                onClick={() => setActiveTab(id)}
              >
                {pick(t.tabs[id], language)}
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
            <p><strong>{pick(t.noPressure, language)}</strong> {pick(t.noPressureText, language)}</p>
          </div>
        </aside>
      </div>

      <h2 className="explorer-lesson-heading">{pick(t.lessons, language)}</h2>
      <nav className="explorer-lesson-rail" ref={railRef} aria-label={pick(t.lessons, language)}>
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
