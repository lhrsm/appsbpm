import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";

let cachedApp: FirebaseApp | null = null;
let cachedVapid: string | null = null;
let configPromise: Promise<{ app: FirebaseApp; vapidKey: string } | null> | null = null;

async function ensureFirebase() {
  if (cachedApp && cachedVapid) return { app: cachedApp, vapidKey: cachedVapid };
  if (configPromise) return configPromise;

  configPromise = (async () => {
    const { data, error } = await supabase.functions.invoke("get-firebase-config");
    if (error || !data?.apiKey) {
      console.error("Falha ao obter Firebase config", error);
      return null;
    }
    const { vapidKey, ...cfg } = data as any;
    cachedApp = getApps().length ? getApp() : initializeApp(cfg);
    cachedVapid = vapidKey;
    return { app: cachedApp, vapidKey: cachedVapid! };
  })();

  return configPromise;
}

export async function getMessagingIfSupported() {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    const ctx = await ensureFirebase();
    if (!ctx) return null;
    return { messaging: getMessaging(ctx.app), vapidKey: ctx.vapidKey };
  } catch {
    return null;
  }
}

export async function requestFcmToken(): Promise<{ token: string | null; reason?: string }> {
  const ctx = await getMessagingIfSupported();
  if (!ctx) return { token: null, reason: "unsupported" };
  if (!ctx.vapidKey) return { token: null, reason: "missing-vapid" };

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return { token: null, reason: "permission-denied" };

  try {
    // Register at default scope ("/"). Custom scopes require a
    // Service-Worker-Allowed response header and cause silent failures.
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await navigator.serviceWorker.ready;

    const token = await getToken(ctx.messaging, {
      vapidKey: ctx.vapidKey,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return { token: null, reason: "no-token" };
    return { token };
  } catch (e: any) {
    console.error("[fcm] getToken failed", e);
    return { token: null, reason: e?.message || "error" };
  }
}

export async function onForegroundMessage(cb: (payload: any) => void) {
  const ctx = await getMessagingIfSupported();
  if (!ctx) return () => {};
  return onMessage(ctx.messaging, cb);
}
