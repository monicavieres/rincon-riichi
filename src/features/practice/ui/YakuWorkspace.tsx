export function YakuWorkspace() {
  return (
    <>
      <section className="yaku-hero sticker-panel" id="startView">
        <div className="yaku-intro"><p className="eyebrow" data-i18n="eyebrow">Módulo jugable</p><h1 data-i18n="title">Identifica el Yaku</h1><p className="subtitle" data-i18n="subtitle">Diez manos rápidas con feedback inmediato.</p><div className="start-chips"><span data-i18n="startChipOne">10 manos</span><span data-i18n="startChipTwo">Selección múltiple</span><span data-i18n="startChipThree">Feedback inmediato</span></div><button className="big-button green start-button" id="startButton" data-i18n="start">Empezar</button></div>
        <aside className="yaku-coach"><div className="speech-bubble" id="coachSpeech" data-i18n="coachReady">Busca primero la forma.</div><img className="mini-chibi sticker-img" id="coachImage" src="../assets/chibi-yaku.png" alt="Monique pensando" /></aside>
      </section>
      <section className="quiz-card sticker-panel" id="quizCard" aria-live="polite" hidden>
        <div className="quiz-topline"><span className="status ready" id="questionCounter">1 / 10</span><span className="score-pill" id="scoreLabel">Puntaje: 0</span></div>
        <div className="hand-card"><p className="eyebrow" data-i18n="handLabel">Mano</p><div className="round-context" id="roundContext" /><div className="quiz-hand" id="quizHand" /></div>
        <div className="answer-zone"><h2 data-i18n="question">¿Qué yaku ves?</h2><p className="answer-help" data-i18n="selectHelp">Selecciona una o más opciones.</p><div className="answer-grid" id="answerGrid" /></div>
        <div className="feedback-panel" id="feedbackPanel" hidden><img className="feedback-coach sticker-img" id="feedbackCoach" src="../assets/chibi-incorrect.png" alt="Monique" /><div className="feedback-copy"><strong id="feedbackTitle" /><p id="feedbackText" /></div></div>
        <div className="quiz-actions"><button className="big-button green" id="submitButton" data-i18n="submit">Enviar</button><button className="big-button green" id="nextButton" data-i18n="next" hidden>Siguiente mano</button><button className="big-button pink" id="restartButton" data-i18n="restart" hidden>Otra vez</button></div>
      </section>
      <section className="final-card sticker-panel" id="finalCard" hidden><div><p className="eyebrow" data-i18n="finalEyebrow">Sesión completa</p><h2 id="finalTitle">Resultado final</h2><p id="finalText" /><button className="big-button pink" id="restartFinalButton" data-i18n="restart">Otra vez</button></div><img className="mini-chibi sticker-img" src="../assets/chibi-score.png" alt="Monique celebrando" /></section>
    </>
  );
}
