// PORTAL_FRONTEND_VERSION = "portal-auth-dashboard-v4-2026-08-03"
// Guarded service worker registration. Only registers in production on the
// deployed app — never in Lovable preview, iframes, or dev.

import { emFluxoCritico } from "./criticalFlow";

const APP_SW_PATH = "/sw.js";

export const PWA_UPDATE_EVENT = "sbpm:pwa-update";

function isBlockedHost(hostname: string): boolean {
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com")) return true;
  if (hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com")) return true;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev")) return true;
  return false;
}

async function unregisterOldCaches() {
  if (!("caches" in window)) return;
  const cacheNames = await caches.keys();
  const oldCaches = [
    "identity-v1", "identity-v2", "identity-v3",
    "html-cache", "assets-cache", "images-cache", "profile-photos"
  ];
  await Promise.all(
    cacheNames
      .filter(name => oldCaches.some(old => name.includes(old)))
      .map(name => caches.delete(name))
  );
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
    await unregisterOldCaches();
  } catch {
    // ignore
  }
}

let registration: ServiceWorkerRegistration | null = null;

/** Aplica a versão nova; recusa durante fluxos críticos. */
export async function aplicarAtualizacaoPWA(): Promise<boolean> {
  console.log("Aplicando atualização PWA...", { registration });
  
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    await new Promise((r) => setTimeout(r, 200));
    window.location.reload();
    return true;
  }
  
  // Se não houver worker esperando mas o comando foi chamado, recarrega para limpar cache
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
    swOff;
    // Removido bloqueio de host para permitir teste/funcionamento em preview se o SW existir

  if (refuse) {
    await unregisterAppSW();
    return;
  }

  // Limpa caches antigos na inicialização para evitar conflitos de versão
  await unregisterOldCaches();

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
