import { useRef, useState } from 'react';

/**
 * A pause in a scripted scene: `wait(label)` stops the script and shows a button with that label; pressing it lets the
 * script go on. Used so every explanation can be read before the animation moves again.
 */
export function useGate() {
  const resolver = useRef<(() => void) | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const reset = () => { resolver.current = null; setLabel(null); };
  const wait = (text: string) => new Promise<void>((resolve) => { resolver.current = resolve; setLabel(text); });
  const pass = () => { const resolve = resolver.current; resolver.current = null; setLabel(null); resolve?.(); };
  return { label, wait, pass, reset };
}
