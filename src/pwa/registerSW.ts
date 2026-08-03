// Guarded service worker registration. Only registers in production on the
// deployed app — never in Lovable preview, iframes, or dev.

import { emFluxoCritico } from "./criticalFlow";

const APP_SW_PATH = "/dev-sw.js?dev-sw"; // Fallback para desenvolvimento/preview se o sw.js não existir

export const PWA_UPDATE_EVENT = "sbpm:pwa-update";

function isBlockedHost(hostname: string): boolean {
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com")) return true;
  if (hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com")) return true;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev")) return true;
  return false;
}

async function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(APP_SW_PATH);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    // ignore
  }
}

let registration: ServiceWorkerRegistration | null = null;

/** Aplica a versão nova; recusa durante fluxos críticos. */
export async function aplicarAtualizacaoPWA(): Promise<boolean> {
  if (emFluxoCritico() || !registration?.waiting) return false;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  await new Promise((r) => setTimeout(r, 150));
  window.location.reload();
  return true;
}

function anunciarAtualizacao() {
  window.dispatchEvent(new CustomEvent(PWA_UPDATE_EVENT));
}

export async function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const inIframe = window.self !== window.top;
  const url = new URL(window.location.href);
  const swOff = url.searchParams.get("sw") === "off";
  const hostname = window.location.hostname;

  const refuse =
    !import.meta.env.PROD ||
    inIframe ||
    swOff ||
    isBlockedHost(hostname);

  if (refuse) {
    await unregisterAppSW();
    return;
  }

  try {
    registration = await navigator.serviceWorker.register(APP_SW_PATH, { scope: "/" });

    if (registration.waiting) anunciarAtualizacao();
    registration.addEventListener("updatefound", () => {
      const sw = registration?.installing;
      sw?.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) anunciarAtualizacao();
      });
    });

    // Verificação periódica discreta (a cada 30 min), sem interromper o uso.
    setInterval(() => void registration?.update(), 30 * 60_000);
  } catch {
    // ignore
  }
}
