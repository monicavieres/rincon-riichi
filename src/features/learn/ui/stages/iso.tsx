import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react';

/** Lift of a tile above the felt, in tile thicknesses; a hair per stacking order keeps overlapping tiles from fighting. */
export const TILE_THICK = 3.2;

export type Lifted = { h?: number; z: number };

export const lift = (pose: Lifted) => (pose.h ?? 0) * TILE_THICK + (pose.z % 64) * 0.03;

export const tileTransform = (pose: Lifted & { rot: number }) =>
  `translate3d(-50%, -50%, calc(var(--u) * ${lift(pose)})) rotate(${pose.rot}deg)`;

/** Camera: the player sits at the bottom edge looking across the table, tilted this many degrees from flat. */
export const TILT = 52;

/** Text that stands up facing the camera. `anchor` is the translate that places it relative to its point. */
export const billboard = (anchor = '-50%, -50%', raise = 0) =>
  `translate(${anchor}) translateZ(calc(var(--u) * ${raise})) rotateX(-${TILT}deg)`;

/**
 * Plane coordinates (0–100 across the table) under a pointer, found by casting the pointer ray onto the tilted plane
 * through the same perspective the CSS uses (`perspective` = world width, plane nudged 3% of the width up).
 * `offsetX` is not reliable on 3D planes, so this inverts the projection by hand.
 */
export function unitsOf(event: ReactPointerEvent<HTMLElement>): { x: number; y: number } {
  const plane = event.currentTarget;
  const world = plane.parentElement!.getBoundingClientRect();
  const size = plane.offsetWidth || 1;
  const P = world.width;
  const c = Math.cos((TILT * Math.PI) / 180);
  const sn = Math.sin((TILT * Math.PI) / 180);
  const z0 = size * 0.084; // tiles and dice sit about 8 units above the table top
  const dy0 = world.width * -0.03; // the plane is nudged 3cqw up in CSS
  const sx = event.clientX - (world.left + world.width / 2);
  const sy = event.clientY - (world.top + world.height / 2);
  const v = (sy * P - sy * z0 * c - P * dy0 + P * z0 * sn) / (sy * sn + P * c);
  const z = v * sn + z0 * c;
  const scale = P / (P - z);
  const u = sx / scale;
  return { x: (u / size + 0.5) * 100, y: (v / size + 0.5) * 100 };
}

const faces = (
  <>
    <i className="bx-f bx-s" />
    <i className="bx-f bx-e" />
    <i className="bx-f bx-w" />
    <i className="bx-f bx-n" />
  </>
);

/** A block seen in 3D: `top` rides on its upper face, four sides give it thickness. */
export function Box({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <span className={`bx ${className}`} style={style}>
      <span className="bx-top">{children}</span>
      {faces}
    </span>
  );
}

/** One tile: the theme's back colour and emblem on top of a block banded like the home table. Position and angle are set imperatively by the boards. */
export function TileBox({ refCb, className = '', style }: { refCb?: (el: HTMLSpanElement | null) => void; className?: string; style?: CSSProperties }) {
  return (
    <span className={`deck-tile bx ${className}`} ref={refCb} style={style}>
      <span className="bx-top tile-top" />
      {faces}
    </span>
  );
}

/**
 * The isometric stage: a table with legs and a felt top, seen from a corner with no perspective.
 * Everything inside `children` lives on the felt and is positioned in plane units (x, y from 0 to 100).
 */
export function IsoWorld({ planeRef, handlers, children }: {
  planeRef: RefObject<HTMLDivElement | null>;
  handlers?: {
    onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
  children: ReactNode;
}) {
  return (
    <div className="deck-world">
      <div className="deck-plane" ref={planeRef} {...handlers}>
        <span className="iso-ground" />
        {[[3, 3], [90, 3], [3, 90], [90, 90]].map(([x, y]) => (
          <Box key={`${x}-${y}`} className="iso-leg" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <Box className="iso-slab">
          <span className="iso-felt" />
        </Box>
        <div className="iso-level">{children}</div>
      </div>
    </div>
  );
}
