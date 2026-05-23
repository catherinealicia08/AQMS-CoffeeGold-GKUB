importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDN7vMR2--djst7PZh5jW5WViQ7Too_t_c',
  authDomain: 'aqms-coffeegold.firebaseapp.com',
  projectId: 'aqms-coffeegold',
  storageBucket: 'aqms-coffeegold.firebasestorage.app',
  messagingSenderId: '279030014865',
  appId: '1:279030014865:web:115c4c15ac7c9a110ab',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? 'AQMS CoffeeGold', {
    body: body ?? '',
    icon: icon ?? '/coffee.png',
  });
});
