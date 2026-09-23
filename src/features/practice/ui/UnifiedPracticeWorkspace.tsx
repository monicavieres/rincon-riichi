import type { PracticeDefinition } from '../domain/practiceCatalog';

export function UnifiedPracticeWorkspace({ definition }: { definition: PracticeDefinition }) {
  const tileName = definition.key === 'tileName';
  return (
    <>
      <section className="tile-start sticker-panel" id="startView" hidden={!tileName}>
        <div className="tile-start-inner">
          <div className="tile-coach"><div className="speech-bubble" id="startCoach">Mira la mano, responde y revisa tu puntaje al final.</div><img className="mini-chibi sticker-img" id="startChibi" src={`../assets/${definition.chibi}`} alt="Monique coach" /></div>
          <p className="eyebrow" data-i18n={tileName ? 'tileStart.eyebrow' : undefined}>Módulo jugable</p>
          <h1 id="startTitle" data-i18n={tileName ? 'tileStart.title' : undefined}>{definition.title}</h1>
          <p className="subtitle" id="startSubtitle" data-i18n={tileName ? 'tileStart.subtitle' : undefined}>Elige un modo para comenzar.</p>
          {tileName ? <div className="tile-modes" id="tileModes" /> : <button className="big-button green start-button" id="startButton">Empezar</button>}
          <div className="tile-start-chips" aria-hidden="true"><span id="chipOne">10 rondas</span><span id="chipTwo">Feedback inmediato</span><span id="chipThree">Puntaje final</span></div>
        </div>
      </section>
      <section className="results-card sticker-panel" id="resultsCard" hidden>
        <div className="results-head"><p className="eyebrow">Sesión completa</p><h2>Resultado final</h2><p className="results-score">Puntaje <strong id="resultsScore">0 / 0</strong></p></div>
        <div className="results-body" id="resultsBody" />
        <div className="results-actions"><button className="big-button green" id="replayButton">Jugar otra vez</button><button className="big-button pink" id={tileName ? 'backModeButton' : 'backButton'}>Cambiar de modo</button></div>
      </section>
      <section className="module-card-screen sticker-panel" id="quizCard" hidden>
        <div className="module-topline"><span className="status ready" id="roundLabel">1 / 10</span><span className="module-pill" id="scoreLabel">Puntaje: 0</span></div>
        <div className="module-hand-card"><p className="eyebrow" data-i18n={tileName ? 'tileLabel' : 'handLabel'}>{tileName ? 'Ficha' : 'Mano'}</p><div className="round-context" id="roundContext" /><div className="module-hand" id="hand" />{tileName && <div className="tile-explain-modal" id="tileExplainModal" hidden><div className="tile-explain-tile" id="tileExplainTile" /><div className="tile-explain-copy"><strong id="tileExplainTitle" /><p id="tileExplainText" /></div></div>}</div>
        <div className="module-question-card"><p className="eyebrow" data-i18n="eyebrow">Práctica</p><h1 id="questionTitle" /><p id="questionHelp" /><div className={`choice-grid ${tileName ? 'tile-name-choices' : 'tile-choices'}`} id="choices" /></div>
        <div className="feedback-panel" id="feedback" hidden><strong id="feedbackTitle" /><p id="feedbackText" /></div>
        <div className="module-actions"><button className="big-button green" id="submitButton" data-i18n="submit">Enviar</button><button className="big-button green" id="nextButton" data-i18n="next" hidden>Siguiente</button><button className="big-button pink" id="restartButton" data-i18n="restart" hidden>Otra vez</button></div>
      </section>
    </>
  );
}
