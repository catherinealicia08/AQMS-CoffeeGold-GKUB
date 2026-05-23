const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aqms/shared'],
};

// Generate firebase-messaging-sw.js with env vars injected at build/dev time
const swContent = `importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}',
  authDomain: '${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}',
  projectId: '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}',
  storageBucket: '${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? 'Coffee Gold', {
    body: body ?? '',
    icon: icon ?? '/coffee.png',
  });
});
`;

fs.writeFileSync(path.join(__dirname, 'public', 'firebase-messaging-sw.js'), swContent);

module.exports = nextConfig;
