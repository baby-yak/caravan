import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { app } from './services/app.js';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

await app.start();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
