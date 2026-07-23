/* Firebase Cloud Messaging service worker for background notifications.
   This worker is separate from any app-shell service worker. */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDummy_REPLACE_IF_NEEDED",
  authDomain: "appsbpm-1fd57.firebaseapp.com",
  projectId: "appsbpm-1fd57",
  storageBucket: "appsbpm-1fd57.firebasestorage.app",
  messagingSenderId: "29143389514",
  appId: "1:29143389514:web:9342ff38021f8ef2911db3",
});

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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
