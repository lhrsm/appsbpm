import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./pwa/registerSW";

import { bootstrapA11yPreferences } from "./a11y/preferences";

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ROOT ERROR MESSAGE", error.message);
    console.error("ROOT ERROR STACK", error.stack);
    console.error("ROOT COMPONENT STACK", errorInfo.componentStack);
    console.error("[RootErrorBoundary] CRITICAL ERROR:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>Portal da SBPM</h1>
          <p>Não foi possível iniciar a aplicação.</p>
          <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f8f8', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'left', overflow: 'auto' }}>
            <code>{this.state.error?.toString()}</code>
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Recarregar</button>
          <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: '#888' }}>
            Build de diagnóstico: recovery-dashboard-2026-08-03
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


bootstrapA11yPreferences();

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);

registerPWA();
