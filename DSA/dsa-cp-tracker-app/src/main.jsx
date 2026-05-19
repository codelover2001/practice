import React from 'react';
import { createRoot } from 'react-dom/client';
import DSATracker from '../../dsa_cp_tracker.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DSATracker />
  </React.StrictMode>
);
