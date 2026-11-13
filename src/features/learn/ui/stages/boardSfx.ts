import { sfx } from '../../../../shared/sound/tileSfx';
import { FELT_Z } from './iso3d';

export { sfx };

/** The sound of a tile flight landing: on the felt it is a discard, anywhere higher (a hand) it is a draw. */
export function landSfx(entry: { to: { z: number }; dur: number }) {
  sfx.play(entry.to.z <= FELT_Z + 1.2 ? 'discard' : 'draw', entry.dur * 0.85);
}
