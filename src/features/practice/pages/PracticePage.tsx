import { useLayoutEffect } from 'react';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { SoftBackground } from '../../../shared/ui/SoftBackground';
import { getPracticeDefinition } from '../domain/practiceCatalog';
import { UnifiedPracticeWorkspace } from '../ui/UnifiedPracticeWorkspace';
import { YakuWorkspace } from '../ui/YakuWorkspace';

export function PracticePage() {
  const definition = getPracticeDefinition(window.location.pathname);
  useLayoutEffect(() => {
    document.body.className = definition.key === 'yaku' ? 'yaku-body' : 'module-body';
    if (definition.key !== 'yaku') document.body.dataset.modulePage = definition.key;
    document.title = `${definition.title} · Rincón Riichi`;
  }, [definition]);

  return <><SoftBackground /><main className={`app-shell ${definition.key === 'yaku' ? 'yaku-shell' : 'module-shell'}`}><AppHeader title={definition.title} backTo="practicar" />{definition.key === 'yaku' ? <YakuWorkspace /> : <UnifiedPracticeWorkspace definition={definition} />}</main></>;
}
