import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/shippori-mincho/latin-500.css';
import '@fontsource/shippori-mincho/latin-700.css';
import '@fontsource/shippori-mincho/latin-800.css';
import '@fontsource/zen-kaku-gothic-new/latin-400.css';
import '@fontsource/zen-kaku-gothic-new/latin-500.css';
import '@fontsource/zen-kaku-gothic-new/latin-700.css';
import './styles/base.css';
import './styles/scene.css';
import './styles/chrome.css';
import './styles/sections.css';
import './styles/features.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
