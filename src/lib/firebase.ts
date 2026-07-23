import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyDummy_REPLACE_IF_NEEDED",
  authDomain: "appsbpm-1fd57.firebaseapp.com",
  projectId: "appsbpm-1fd57",
  storageBucket: "appsbpm-1fd57.firebasestorage.app",
  messagingSenderId: "29143389514",
  appId: "1:29143389514:web:9342ff38021f8ef2911db3",
};

export const VAPID_KEY =
  "BKBZvrfMLSyYgxHnC-zDLPh5RNAlyb7nQBhWbHejdUMlSFeJMfdWbQdJhnmB6ZKecnfz11CGhOPIrkil6zfE89k";

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function getMessagingIfSupported() {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(firebaseApp);
  } catch {
    return null;
  }
}

export async function requestFcmToken(): Promise<string | null> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  // Register the messaging service worker explicitly so it doesn't conflict
  // with the app shell service worker.
  const swReg = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/firebase-cloud-messaging-push-scope" }
  );

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  return token || null;
}

export async function onForegroundMessage(cb: (payload: any) => void) {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}
