import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The actual component lives at ../dsa_cp_tracker.jsx (one level above this
// app), but its deps (`react`, `react-dom`, `lucide-react`) are only installed
// inside this app's node_modules. So we (a) allow Vite to serve files from the
// parent DSA folder, and (b) alias bare-module imports to *this* app's
// node_modules — otherwise Node's resolution walks up from DSA/ and fails.
const localModules = path.resolve(__dirname, 'node_modules');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.join(localModules, 'react'),
      'react-dom': path.join(localModules, 'react-dom'),
      'react/jsx-runtime': path.join(localModules, 'react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.join(localModules, 'react/jsx-dev-runtime.js'),
      'lucide-react': path.join(localModules, 'lucide-react'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'lucide-react'],
  },
  server: {
    port: 5175,
    open: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
});
