import { AppHeader } from '../../../shared/ui/AppHeader';
import { SoftBackground } from '../../../shared/ui/SoftBackground';
import { learnModules, practiceModules } from '../domain/moduleCatalog';
import { ModuleGrid } from '../ui/ModuleGrid';

export function HomePage() {
  return (
    <>
      <SoftBackground />
      <main className="app-shell">
        <AppHeader home />
        <section className="hero" id="inicio" data-home-section>
          <div className="hero-copy sticker-panel">
            <p className="eyebrow" data-i18n="hero.eyebrow">Mahjong riichi</p>
            <h1 data-i18n="hero.title">Aprende, practica y mejora</h1>
            <p className="subtitle" data-i18n="hero.subtitle">Módulos claros y ejercicios con corrección inmediata para entender cada mano y jugar mejor.</p>
            <div className="hero-actions">
              <a className="big-button pink" href="#aprender"><span data-i18n="actions.learn">Aprender</span></a>
              <a className="big-button green" href="#practicar"><span data-i18n="actions.practice">Practicar</span></a>
            </div>
          </div>
          <aside className="coach-zone" aria-label="Asistente chibi">
            <img className="hero-chibi sticker-img" src="assets/chibi-coach.png" alt="Monique, guía chibi de mahjong con un libro" />
            <div className="hero-chips"><span className="hero-chip" data-i18n="hero.chip1">Módulos guiados</span><span className="hero-chip" data-i18n="hero.chip2">3 idiomas</span><span className="hero-chip" data-i18n="hero.chip3">Gratis</span></div>
          </aside>
        </section>
        <section className="section-heading" id="aprender" data-home-section><h2 data-i18n="modules.title">Aprender</h2><p data-i18n="modules.subtitle">Conceptos, reglas y referencias para entender Riichi.</p></section>
        <ModuleGrid modules={learnModules} className="section-grid" />
        <section className="section-heading compact minigame-heading" id="practicar" data-home-section><h2 data-i18n="modules.minigamesTitle">Practicar</h2><p data-i18n="modules.minigamesSubtitle">Manos concretas y feedback inmediato.</p></section>
        <ModuleGrid modules={practiceModules} className="minigame-grid" />
        <section className="section-heading" id="recursos" data-home-section><h2 data-i18n="resources.title">Recursos y relacionados</h2><p data-i18n="resources.subtitle">Fuentes, comunidades y lugares para seguir aprendiendo.</p></section>
        <section className="module-grid resources-grid" aria-label="Recursos externos">
          <a className="resource-card" href="recursos/fuentes.html"><span className="module-icon icon-fuentes" aria-hidden="true" /><h3 data-i18n="resources.credits.title">Fuentes y créditos</h3><p data-i18n="resources.credits.desc">Fuentes y datos usados en el sitio.</p><span className="card-arrow">→</span></a>
          <a className="resource-card" href="recursos/comunidades.html"><span className="module-icon icon-comunidades" aria-hidden="true" /><h3 data-i18n="resources.communities.title">Comunidades</h3><p data-i18n="resources.communities.desc">Foros, Discord y clubes.</p><span className="card-arrow">→</span></a>
          <a className="resource-card" href="recursos/jugar.html"><span className="module-icon icon-jugar" aria-hidden="true" /><h3 data-i18n="resources.play.title">Jugar online</h3><p data-i18n="resources.play.desc">Servidores y clientes de Riichi.</p><span className="card-arrow">→</span></a>
          <a className="resource-card" href="recursos/bibliotecas.html"><span className="module-icon icon-bibliotecas" aria-hidden="true" /><h3 data-i18n="resources.libraries.title">Bibliotecas y organizaciones</h3><p data-i18n="resources.libraries.desc">Reglamentos, federaciones y bibliotecas.</p><span className="card-arrow">→</span></a>
        </section>
        <footer className="site-credit"><span>© 2026 monicavieres. Rincón Riichi.</span><a href="https://github.com/monicavieres" target="_blank" rel="noreferrer">GitHub: monicavieres</a></footer>
      </main>
    </>
  );
}
