import { AppHeader } from '../../../shared/ui/AppHeader';
import { SoftBackground } from '../../../shared/ui/SoftBackground';
import { learnModules, practiceModules } from '../domain/moduleCatalog';
import { ModuleGrid } from '../ui/ModuleGrid';
import { explorerText } from '../domain/tableExplorerCopy';
import { pick, useLanguage } from '../../../shared/i18n/useLanguage';
import { RiichiTableExplorer } from '../ui/RiichiTableExplorer';

function HomeHeadline() {
  const language = useLanguage();
  return <><h1 id="table-explorer-title">{pick(explorerText.headline, language)}</h1><p>{pick(explorerText.hint, language)}</p></>;
}

export function HomePage() {
  return (
    <>
      <SoftBackground />
      <main className="app-shell">
        <AppHeader
          home
          headline={<HomeHeadline />}
        />
        <div id="inicio" data-home-section><RiichiTableExplorer /></div>
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
