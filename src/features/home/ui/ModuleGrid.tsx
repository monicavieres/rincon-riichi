import type { ModuleCard } from '../domain/moduleCatalog';

export function ModuleGrid({ modules, className = '' }: { modules: ModuleCard[]; className?: string }) {
  return (
    <section className={`module-grid ${className}`}>
      {modules.map((module) => (
        <a className={`module-card ${module.tone}-card featured`} href={module.route} key={module.id} data-module={module.id}>
          <span className={`module-icon ${module.icon}`} aria-hidden="true" />
          <span className="status ready" data-i18n="status.mvp">MVP</span>
          <h3 data-i18n={`${module.translationBase}.title`}>{module.title}</h3>
          <p data-i18n={`${module.translationBase}.desc`}>{module.description}</p>
        </a>
      ))}
    </section>
  );
}
