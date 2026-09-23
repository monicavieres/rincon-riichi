import { useLayoutEffect } from 'react';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { SoftBackground } from '../../../shared/ui/SoftBackground';
import { resourceMeta } from '../domain/resourceCatalog';

export function ResourcePage() {
  const file = window.location.pathname.split('/').pop() ?? '';
  const meta = resourceMeta[file] ?? resourceMeta['fuentes.html'];
  useLayoutEffect(() => { document.body.className = 'links-body'; document.title = `${meta.title} · Rincón Riichi`; }, [meta]);
  return <><SoftBackground /><main className="app-shell links-shell"><AppHeader title={meta.title} backTo="aprender" /><section className="links-hero sticker-panel"><p className="eyebrow">Recursos</p><h1>{meta.title}</h1><p className="subtitle">{meta.description}</p></section><section className="links-grid">{meta.links.map((link) => <a className="link-card" href={link.url} target="_blank" rel="noreferrer" key={link.url}><span className="link-tag">{link.tag}</span><h3>{link.name}</h3><p>{link.description}</p><span className="link-domain">{new URL(link.url).hostname}</span></a>)}</section></main></>;
}
