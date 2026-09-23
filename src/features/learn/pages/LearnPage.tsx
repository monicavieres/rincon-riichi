import { useLayoutEffect } from 'react';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { SoftBackground } from '../../../shared/ui/SoftBackground';
import { getLearnDefinition } from '../domain/learnCatalog';
import { LearnWorkspace } from '../ui/LearnWorkspaces';

export function LearnPage() {
  const definition = getLearnDefinition(window.location.pathname);
  useLayoutEffect(() => {
    document.body.className = definition.bodyClass;
    document.title = `${definition.title} · Rincón Riichi`;
  }, [definition]);

  return <><SoftBackground /><main className={`app-shell ${definition.shellClass}`}><AppHeader title={definition.title} backTo="aprender" /><LearnWorkspace kind={definition.kind} /></main></>;
}
