# dsa-cp-tracker-app

Minimal Vite + React 19 wrapper to run `DSA/dsa_cp_tracker.jsx` (the
`DSATracker` component) locally in the browser.

The component file itself lives at `DSA/dsa_cp_tracker.jsx`; this app
imports it via a relative parent path, so there is no duplication.

## Run

```bash
cd DSA/dsa-cp-tracker-app
npm install
npm run dev
```

Then open http://localhost:5175 (Vite will open it automatically).
Port 5175 is used because 5173/5174 are taken by other local Vite servers.
If 5175 is also taken, edit `vite.config.js` and pick another free port.

## Build

```bash
npm run build
npm run preview   # serves the production build on http://localhost:4173
```
