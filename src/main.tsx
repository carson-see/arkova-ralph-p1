/**
 * Ralph Application Entry Point
 *
 * This is a minimal entry point for the Bedrock (P1) phase.
 * The focus of P1 is database schema, RLS, types, and documentation.
 * Full UI will be built in subsequent phases.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

export function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Ralph</h1>
      <p>Document anchoring system - Bedrock phase complete.</p>
      <p>
        See <code>docs/confluence/</code> for documentation.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
