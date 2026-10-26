import { PracticeRail } from './UnifiedPracticeWorkspace';

/** The yaku drill, laid out like the other practice drills: stage, inspector and the rail of drills. */
export function YakuWorkspace() {
  return (
    <section className="table-explorer tutorial-lab practice-lab" aria-label="Identifica el Yaku">
      <div className="table-explorer-workspace" id="startView">
        <div className="table-explorer-stage practice-coach">
          <div className="tile-coach"><div className="speech-bubble" id="coachSpeech" data-i18n="coachReady">Busca primero la forma.</div><img className="mini-chibi sticker-img" id="coachImage" src="../assets/chibi-yaku.png" alt="Monique pensando" /></div>
          <div className="tile-start-chips" aria-hidden="true"><span data-i18n="startChipOne">10 manos</span><span data-i18n="startChipTwo">Selección múltiple</span><span data-i18n="startChipThree">Feedback inmediato</span></div>
        </div>
        <aside className="table-explorer-inspector">
          <nav className="explorer-tabs"><button type="button" className="is-active" data-i18n="eyebrow">Módulo jugable</button></nav>
          <div className="explorer-inspector-copy">
            <h2 data-i18n="title">Identifica el Yaku</h2>
            <p data-i18n="subtitle">Diez manos rápidas con feedback inmediato.</p>
            <button className="big-button green start-button" id="startButton" data-i18n="start">Empezar</button>
          </div>
        </aside>
      </div>

      <div className="table-explorer-workspace" id="quizCard" aria-live="polite" hidden>
        <div className="table-explorer-stage">
          <div className="explorer-progress"><span className="status ready" id="questionCounter">1 / 10</span><strong className="module-pill" id="scoreLabel">Puntaje: 0</strong></div>
          <div className="tiles-felt practice-felt">
            <p className="eyebrow" data-i18n="handLabel">Mano</p>
            <div className="round-context" id="roundContext" />
            <div className="module-hand quiz-hand" id="quizHand" />
          </div>
        </div>
        <aside className="table-explorer-inspector">
          <nav className="explorer-tabs"><button type="button" className="is-active" data-i18n="question">¿Qué yaku ves?</button></nav>
          <div className="explorer-inspector-copy">
            <h2 data-i18n="question">¿Qué yaku ves?</h2>
            <p className="answer-help" data-i18n="selectHelp">Selecciona una o más opciones.</p>
            <div className="answer-grid" id="answerGrid" />
            <div className="feedback-panel" id="feedbackPanel" hidden><img className="feedback-coach sticker-img" id="feedbackCoach" src="../assets/chibi-incorrect.png" alt="Monique" /><div className="feedback-copy"><strong id="feedbackTitle" /><p id="feedbackText" /></div></div>
            <div className="module-actions quiz-actions"><button className="big-button green" id="submitButton" data-i18n="submit">Enviar</button><button className="big-button green" id="nextButton" data-i18n="next" hidden>Siguiente mano</button><button className="big-button pink" id="restartButton" data-i18n="restart" hidden>Otra vez</button></div>
          </div>
        </aside>
      </div>

      <div className="table-explorer-workspace" id="finalCard" hidden>
        <div className="table-explorer-stage practice-coach">
          <img className="mini-chibi sticker-img" src="../assets/chibi-score.png" alt="Monique celebrando" />
        </div>
        <aside className="table-explorer-inspector">
          <nav className="explorer-tabs"><button type="button" className="is-active" data-i18n="finalEyebrow">Sesión completa</button></nav>
          <div className="explorer-inspector-copy">
            <h2 id="finalTitle">Resultado final</h2>
            <p id="finalText" />
            <button className="big-button pink" id="restartFinalButton" data-i18n="restart">Otra vez</button>
          </div>
        </aside>
      </div>

      <PracticeRail current="yaku" />
    </section>
  );
}
