/* Firebase Cloud Messaging service worker (background notifications).
   Config is fetched from the Edge Function so secrets stay server-side. */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const CONFIG_URL =
  "https://iidqanlvudhrqobipimf.supabase.co/functions/v1/get-firebase-config";

self.addEventListener("install", (event) => {
  event.waitUntil(
    fetch(CONFIG_URL)
      .then((r) => r.json())
      .then((cfg) => {
        // eslint-disable-next-line no-undef
        firebase.initializeApp({
          apiKey: cfg.apiKey,
          authDomain: cfg.authDomain,
          projectId: cfg.projectId,
          storageBucket: cfg.storageBucket,
          messagingSenderId: cfg.messagingSenderId,
          appId: cfg.appId,
        });
        // eslint-disable-next-line no-undef
        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
          const title = payload.notification?.title || "SBPM";
          const options = {
            body: payload.notification?.body || "",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: payload.data || {},
          };
          self.registration.showNotification(title, options);
        });
      })
      .catch((e) => console.error("[fcm-sw] init failed", e))
  );
});

self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
