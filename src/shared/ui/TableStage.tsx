import { useMemo, type CSSProperties } from 'react';
import {
  projectToPercent,
  tableArtPath,
  zoneBounds,
  type TableArt,
  type TableCallout,
  type TableFocus,
  type TablePoint,
} from '../table/geometry';

/** The table illustration in every theme; CSS shows the one matching the current theme. */
export function ThemedArt({ art, className, alt = '' }: { art: TableArt; className?: string; alt?: string }) {
  return (
    <>
      <img className={`rr-only-light${className ? ` ${className}` : ''}`} src={tableArtPath(art, 'light')} alt={alt} />
      <img className={`rr-only-dark${className ? ` ${className}` : ''}`} src={tableArtPath(art, 'dark')} alt="" aria-hidden="true" />
      <img className={`rr-only-cute${className ? ` ${className}` : ''}`} src={tableArtPath(art, 'cute')} alt="" aria-hidden="true" />
      <img className={`rr-only-samurai${className ? ` ${className}` : ''}`} src={tableArtPath(art, 'samurai')} alt="" aria-hidden="true" />
    </>
  );
}

// A thumbnail is the table itself, framed on a zone, so each card shows exactly what its step is about.
const THUMB = { w: 72, h: 56 };
const TABLE_RATIO = 1055.2 / 694;

export function ZoneThumb({ focus }: { focus: TableFocus }) {
  const b = zoneBounds(focus);
  const scale = Math.min((0.86 * 100) / (b.x1 - b.x0), (0.86 * 100 * THUMB.h * TABLE_RATIO) / ((b.y1 - b.y0) * THUMB.w));
  const width = THUMB.w * scale;
  const height = width / TABLE_RATIO;
  const style: CSSProperties = {
    width: `${width}px`,
    left: `${THUMB.w / 2 - (b.cx / 100) * width}px`,
    top: `${THUMB.h / 2 - (b.cy / 100) * height}px`,
  };
  return (
    <span className="lesson-thumb" aria-hidden="true">
      <img className="rr-only-light" src={tableArtPath('mesa', 'light')} alt="" style={style} />
      <img className="rr-only-dark" src={tableArtPath('mesa', 'dark')} alt="" style={style} />
      <img className="rr-only-cute" src={tableArtPath('mesa', 'cute')} alt="" style={style} />
      <img className="rr-only-samurai" src={tableArtPath('mesa', 'samurai')} alt="" style={style} />
    </span>
  );
}

export type StageHotspot = { id: string; label: string; at: TablePoint };

type TableStageProps = {
  /** The zone the camera frames; its zoom is ignored while `overview` is on. */
  focus: TableFocus;
  callouts: TableCallout[];
  /** Changes whenever the step changes, so outlines and callouts replay their entrance. */
  stepKey: string;
  overview?: boolean;
  /** Numbered points shown on the full table (the home tour uses them to jump between zones). */
  hotspots?: StageHotspot[];
  activeHotspot?: string;
  onHotspot?: (id: string) => void;
  hotspotAria?: (label: string) => string;
  alt: string;
};

/** The isometric table with a camera: zooms to a zone, dims the rest, outlines the zone and places labelled callouts. */
export function TableStage({ focus, callouts, stepKey, overview = false, hotspots = [], activeHotspot, onHotspot, hotspotAria, alt }: TableStageProps) {
  const camera = useMemo(() => {
    const { outlines, cx, cy } = zoneBounds(focus);
    const zoom = overview ? 1 : focus.zoom;
    const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * zoom, v));
    return { outlines, zoom, tx: clamp(50 - cx * zoom), ty: clamp(50 - cy * zoom) };
  }, [focus, overview]);
  const zoomed = camera.zoom > 1;

  return (
    <div className={`table-explorer-tilt${zoomed ? ' is-zoomed' : ''}`}>
      <div
        className="table-explorer-visual"
        style={{
          transform: `translate(${camera.tx}%, ${camera.ty}%) scale(${camera.zoom})`,
          ['--inv-zoom' as string]: 1 / camera.zoom,
        }}
      >
        <ThemedArt art="mesa" alt={alt} />
        <svg className="table-spotlight" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <mask id="table-spotlight-mask">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              {camera.outlines.map((outline, i) => <polygon key={i} points={outline.map((p) => p.join(',')).join(' ')} fill="black" />)}
            </mask>
          </defs>
          <rect className={`table-spotlight-dim${zoomed ? ' is-on' : ''}`} x="0" y="0" width="100" height="100" mask="url(#table-spotlight-mask)" />
          {camera.outlines.map((outline, i) => (
            <polygon key={`${stepKey}-${i}`} className="table-spotlight-edge" points={outline.map((p) => p.join(',')).join(' ')} />
          ))}
        </svg>
        {hotspots.map((hotspot, index) => {
          const [x, y] = projectToPercent(hotspot.at);
          return (
            <button
              className={`table-hotspot${activeHotspot === hotspot.id ? ' is-active' : ''}`}
              key={hotspot.id}
              type="button"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={hotspotAria ? hotspotAria(hotspot.label) : hotspot.label}
              aria-pressed={activeHotspot === hotspot.id}
              onClick={() => onHotspot?.(hotspot.id)}
            >
              <span>{index + 1}</span>
              <b>{hotspot.label}</b>
            </button>
          );
        })}
        {callouts.map((callout, index) => {
          const [x, y] = projectToPercent(callout.at);
          const length = Math.hypot(callout.dx, callout.dy);
          const angle = (Math.atan2(callout.dy, callout.dx) * 180) / Math.PI;
          return (
            <span
              className={`table-callout${callout.dx < 0 ? ' is-left' : ''}`}
              key={`${stepKey}-${callout.label}`}
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
  );
}
