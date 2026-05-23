// push-sw.js — Service Worker untuk Web Push VAPID
// File ini harus ada di /public/push-sw.js agar bisa diakses sebagai /push-sw.js

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Coffee Gold', body: event.data.text() };
  }

  const title = data.title ?? 'Coffee Gold GKUB';
  const options = {
    body: data.body ?? 'Pesanan Anda siap diambil!',
    icon: data.icon ?? '/coffee.png',
    badge: '/coffee.png',
    tag: data.tag ?? 'order-ready',
    requireInteraction: true,          // Notif tetap muncul sampai ditap (iOS)
    data: {
      url: data.url ?? '/track',       // URL yang dibuka saat notif ditap
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Saat notifikasi ditap → buka tab /track
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? '/track';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Kalau ada tab yang sudah buka app → fokus ke sana
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Kalau tidak ada → buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
