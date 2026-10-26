import type { PracticeDefinition } from '../domain/practiceCatalog';
import { PRACTICE_RAIL } from '../domain/practiceCatalog';

const chevron = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
);

export function PracticeRail({ current }: { current: PracticeDefinition['key'] }) {
  return (
      <nav className="explorer-lesson-rail tutorial-rail" aria-label="Práctica">
        {PRACTICE_RAIL.map((item, i) => (
          <button type="button" key={item.file} className={`is-part-discover${item.key === current ? ' is-active' : ''}`} onClick={() => { window.location.href = item.file; }} aria-current={item.key === current ? 'page' : undefined}>
            <span className="lesson-thumb is-tiles" aria-hidden="true"><b className="dora-thumb">{item.glyph}</b></span>
            <span className="lesson-title"><strong>{i + 1}. {item.title}</strong><small>{item.sub}</small></span>
            <span className="lesson-chev">{chevron}</span>
          </button>
        ))}
      </nav>
  );
}

/**
 * A practice drill laid out like the learn modules: a stage with the hand, an inspector with the question and a rail
 * with every drill. The three screens (start, quiz, results) swap in place; their ids belong to the drill engine.
 */
export function UnifiedPracticeWorkspace({ definition }: { definition: PracticeDefinition }) {
  const tileName = definition.key === 'tileName';
  return (
    <section className="table-explorer tutorial-lab practice-lab" aria-label={definition.title}>
      <div className="table-explorer-workspace" id="startView" hidden={!tileName}>
        <div className="table-explorer-stage practice-coach">
          <div className="tile-coach"><div className="speech-bubble" id="startCoach">Mira la mano, responde y revisa tu puntaje al final.</div><img className="mini-chibi sticker-img" id="startChibi" src={`../assets/${definition.chibi}`} alt="Monique coach" /></div>
          <div className="tile-start-chips" aria-hidden="true"><span id="chipOne">10 rondas</span><span id="chipTwo">Feedback inmediato</span><span id="chipThree">Puntaje final</span></div>
        </div>
        <aside className="table-explorer-inspector">
          <nav className="explorer-tabs"><button type="button" className="is-active" data-i18n={tileName ? 'tileStart.eyebrow' : undefined}>Módulo jugable</button></nav>
          <div className="explorer-inspector-copy">
            <h2 id="startTitle" data-i18n={tileName ? 'tileStart.title' : undefined}>{definition.title}</h2>
            <p id="startSubtitle" data-i18n={tileName ? 'tileStart.subtitle' : undefined}>Elige un modo para comenzar.</p>
            {tileName ? <div className="tile-modes" id="tileModes" /> : <button className="big-button green start-button" id="startButton">Empezar</button>}
          </div>
        </aside>
      </div>

      <div className="table-explorer-workspace" id="resultsCard" hidden>
        <div className="table-explorer-stage practice-coach">
          <div className="results-head"><p className="eyebrow">Sesión completa</p><h2>Resultado final</h2><p className="results-score">Puntaje <strong id="resultsScore">0 / 0</strong></p></div>
        </div>
        <aside className="table-explorer-inspector">
          <nav className="explorer-tabs"><button type="button" className="is-active">Resultado</button></nav>
          <div className="explorer-inspector-copy">
            <div className="results-body" id="resultsBody" />
            <div className="results-actions"><button className="big-button green" id="replayButton">Jugar otra vez</button><button className="big-button pink" id={tileName ? 'backModeButton' : 'backButton'}>Cambiar de modo</button></div>
          </div>
        </aside>
      </div>

      <div className="table-explorer-workspace" id="quizCard" hidden>
        <div className="table-explorer-stage">
          <div className="explorer-progress"><span className="status ready" id="roundLabel">1 / 10</span><strong className="module-pill" id="scoreLabel">Puntaje: 0</strong></div>
          <div className="tiles-felt practice-felt">
            <p className="eyebrow" data-i18n={tileName ? 'tileLabel' : 'handLabel'}>{tileName ? 'Ficha' : 'Mano'}</p>
            <div className="round-context" id="roundContext" />
            <div className="module-hand" id="hand" />
            {definition.key === 'furiten' && <div className="furiten-table" id="furitenTable" />}
            {tileName && <div className="tile-explain-modal" id="tileExplainModal" hidden><div className="tile-explain-tile" id="tileExplainTile" /><div className="tile-explain-copy"><strong id="tileExplainTitle" /><p id="tileExplainText" /></div></div>}
          </div>
        </div>
        <aside className="table-explorer-inspector">
          <nav className="explorer-tabs"><button type="button" className="is-active" data-i18n="eyebrow">Práctica</button></nav>
          <div className="explorer-inspector-copy">
            <h2 id="questionTitle" />
            <p id="questionHelp" />
            <div className={`choice-grid ${tileName ? 'tile-name-choices' : 'tile-choices'}`} id="choices" />
            <div className="feedback-panel" id="feedback" hidden><strong id="feedbackTitle" /><p id="feedbackText" /></div>
            <div className="module-actions"><button className="big-button green" id="submitButton" data-i18n="submit">Enviar</button><button className="big-button green" id="nextButton" data-i18n="next" hidden>Siguiente</button><button className="big-button pink" id="restartButton" data-i18n="restart" hidden>Otra vez</button></div>
          </div>
        </aside>
      </div>

      <PracticeRail current={definition.key} />
    </section>
  );
}
