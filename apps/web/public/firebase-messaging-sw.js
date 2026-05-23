importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Config ini harus sama dengan NEXT_PUBLIC_FIREBASE_* env vars
// Service worker tidak bisa baca env vars, jadi diisi langsung saat build
// atau di-replace via CI/CD. Untuk dev, isi manual di sini.
const firebaseConfig = {
  apiKey: self.__FIREBASE_CONFIG_API_KEY__,
  authDomain: self.__FIREBASE_CONFIG_AUTH_DOMAIN__,
  projectId: self.__FIREBASE_CONFIG_PROJECT_ID__,
  storageBucket: self.__FIREBASE_CONFIG_STORAGE_BUCKET__,
  messagingSenderId: self.__FIREBASE_CONFIG_MESSAGING_SENDER_ID__,
  appId: self.__FIREBASE_CONFIG_APP_ID__,
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  if (!title) return;

  self.registration.showNotification(title, {
    body: body ?? '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data,
  });
});
