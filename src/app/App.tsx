import { useLayoutEffect } from 'react';
import { HomePage } from '../features/home/pages/HomePage';
import { PracticePage } from '../features/practice/pages/PracticePage';
import { LearnPage } from '../features/learn/pages/LearnPage';
import { ResourcePage } from '../features/resources/pages/ResourcePage';

let mountedEventSent = false;

export function App() {
  const path = window.location.pathname;

  useLayoutEffect(() => {
    if (mountedEventSent) return;
    mountedEventSent = true;
    window.dispatchEvent(new Event('rincon:mounted'));
    document.dispatchEvent(new Event('rincon:mounted'));
  }, []);

  if (path.includes('/practicar/')) return <PracticePage />;
  if (path.includes('/aprender/')) return <LearnPage />;
  if (path.includes('/recursos/')) return <ResourcePage />;
  return <HomePage />;
}
