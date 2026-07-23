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

export async function requestFcmToken(): Promise<string | null> {
  const ctx = await getMessagingIfSupported();
  if (!ctx) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const swReg = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/firebase-cloud-messaging-push-scope" }
  );

  const token = await getToken(ctx.messaging, {
    vapidKey: ctx.vapidKey,
    serviceWorkerRegistration: swReg,
  });

  return token || null;
}

export async function onForegroundMessage(cb: (payload: any) => void) {
  const ctx = await getMessagingIfSupported();
  if (!ctx) return () => {};
  return onMessage(ctx.messaging, cb);
}
