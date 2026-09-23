import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './app/styles/app.css';

const root = document.getElementById('root');

if (!root) throw new Error('No se encontró #root para montar Rincón Riichi');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
