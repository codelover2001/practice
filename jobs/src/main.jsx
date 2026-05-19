/* Polyfill Cursor/Claude canvas storage API with localStorage for Chrome */
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value != null ? { value } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
    },
  };
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../job_tracker.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
