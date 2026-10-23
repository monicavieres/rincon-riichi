import { localize, type LocalizedText, type TutorialLanguage } from '../../domain/tutorialContent';
import { tilePath } from './SortBoard';

export type RackTone = 'man' | 'pin' | 'sou' | 'honor' | 'riichi' | 'felt' | 'gold' | 'tsumo';

export type RackGroup = {
  tiles: string[];
  label?: LocalizedText;
  /** Japanese term shown small under the label. */
  term?: string;
  tone?: RackTone;
  /** Tile index laid sideways, as a called tile is. */
  sideways?: number;
  /** Faded tiles: the tile you are waiting for. */
  ghost?: boolean;
  /** The tile just drawn, set apart from the hand. */
  drawn?: boolean;
};

export type RackRow = { caption?: LocalizedText; groups: RackGroup[] };

/** A felt tray with hands of tiles; each group is outlined and named, like the callouts on the table. */
export function RackStage({ rows, footer, language }: { rows: RackRow[]; footer?: LocalizedText; language: TutorialLanguage }) {
  return (
    <div className="rack-stage">
      <div className="rack-board">
        {rows.map((row, rowIndex) => (
          <div className="rack-row" key={rowIndex}>
            {row.caption && <p className="rack-caption">{localize(row.caption, language)}</p>}
            <div className="rack-groups">
              {row.groups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className={`rack-group is-${group.tone ?? 'felt'}${group.drawn ? ' is-drawn' : ''}${group.ghost ? ' is-ghost' : ''}`}
                  style={{ ['--i' as string]: rowIndex * 6 + groupIndex }}
                >
                  <div className="rack-tiles">
                    {group.tiles.map((code, index) => (
                      <img
                        key={index}
                        className={`rack-tile${group.sideways === index ? ' is-sideways' : ''}`}
                        src={tilePath(code)}
                        alt={code}
                        draggable={false}
                      />
                    ))}
                  </div>
                  {group.label && (
                    <span className="rack-label">
                      <i aria-hidden="true" />
                      <b>{localize(group.label, language)}</b>
                      {group.term && <small>{group.term}</small>}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {footer && <p className="rack-footer">{localize(footer, language)}</p>}
      </div>
    </div>
  );
}
