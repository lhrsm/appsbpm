import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./pwa/registerSW";
import { applyStoredTheme } from "./components/ThemeToggle";
import { bootstrapA11yPreferences } from "./a11y/preferences";

applyStoredTheme();
bootstrapA11yPreferences();

createRoot(document.getElementById("root")!).render(<App />);

registerPWA();
