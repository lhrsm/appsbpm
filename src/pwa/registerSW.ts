// Guarded service worker registration. Only registers in production on the
// deployed app — never in Lovable preview, iframes, or dev.

const APP_SW_PATH = "/sw.js";

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
    await navigator.serviceWorker.register(APP_SW_PATH, { scope: "/" });
  } catch {
    // ignore
  }
}
