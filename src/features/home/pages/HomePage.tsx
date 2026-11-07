import { AppHeader } from '../../../shared/ui/AppHeader';
import { SoftBackground } from '../../../shared/ui/SoftBackground';
import { learnModules, practiceModules } from '../domain/moduleCatalog';
import { ModuleGrid } from '../ui/ModuleGrid';
import { ThemedArt } from '../../../shared/ui/TableStage';
import { pick, useLanguage } from '../../../shared/i18n/useLanguage';

const hero = {
  eyebrow: { es: 'Mira · Entiende · Juega', en: 'Look · Understand · Play', pt: 'Veja · Entenda · Jogue' },
  title: { es: 'Aprende y practica Riichi Mahjong', en: 'Learn and practise Riichi Mahjong', pt: 'Aprenda e pratique Riichi Mahjong' },
  goal: {
    es: 'Un lugar para entender el mahjong japonés desde cero: la mesa, las fichas y las reglas, y luego practicarlas con ejercicios cortos.',
    en: 'A place to understand Japanese mahjong from scratch: the table, the tiles and the rules, then practise them with short drills.',
    pt: 'Um lugar para entender o mahjong japonês do zero: a mesa, as peças e as regras, e depois praticar com exercícios curtos.',
  },
  start: { es: 'Empezar el tutorial', en: 'Start the tutorial', pt: 'Começar o tutorial' },
  practice: { es: 'Ir a practicar', en: 'Go practise', pt: 'Ir praticar' },
};

function HomeHero() {
  const language = useLanguage();
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-copy">
        <p className="eyebrow">{pick(hero.eyebrow, language)}</p>
        <h1 id="home-hero-title">{pick(hero.title, language)}</h1>
        <p className="home-hero-goal">{pick(hero.goal, language)}</p>
        <div className="home-hero-actions">
          <a className="big-button green" href="aprender/tutorial.html">{pick(hero.start, language)}</a>
          <a className="big-button pink" href="#practicar">{pick(hero.practice, language)}</a>
        </div>
      </div>
      <div className="home-hero-art"><ThemedArt art="mesa" alt="" /></div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <SoftBackground />
      <main className="app-shell">
        <AppHeader home />
        <div id="inicio" data-home-section><HomeHero /></div>
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
