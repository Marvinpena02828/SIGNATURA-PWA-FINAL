// src/utils/pwaSetup.js

/**
 * Initialize Service Worker and PWA features
 */
export async function initializePWA() {
  console.log('[PWA] Initializing...');

  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js',
      {
        scope: '/',
      }
    );

    console.log('[PWA] Service Worker registered successfully:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] New service worker activated');
      // Optionally show update notification
      showUpdateNotification();
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[PWA] Message from service worker:', event.data);
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

/**
 * Show notification that app has been updated
 */
export function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Signatura Updated', {
      body: 'A new version is available. Please refresh the page.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
    });
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  console.log('[PWA] Requesting notification permission...');

  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('[PWA] Notifications already granted');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('[PWA] Notifications denied');
    return false;
  }

  // Ask for permission
  const permission = await Notification.requestPermission();
  console.log('[PWA] Notification permission:', permission);

  return permission === 'granted';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(vapidPublicKey) {
  console.log('[PWA] Subscribing to push notifications...');

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[PWA] Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('[PWA] Already subscribed to push notifications');
      return existingSubscription;
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[PWA] Subscribed to push notifications:', subscription);
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  console.log('[PWA] Unsubscribing from push notifications...');

  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[PWA] Unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('[PWA] Unsubscribe failed:', error);
  }
}

/**
 * Request installation prompt
 */
export function setupInstallPrompt(onInstallPrompt) {
  console.log('[PWA] Setting up install prompt...');

  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event for later
    deferredPrompt = e;
    // Update UI to show install button
    if (onInstallPrompt) {
      onInstallPrompt(e);
    }
    console.log('[PWA] Install prompt ready');
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    // Clear the deferredPrompt
    deferredPrompt = null;
  });

  // Return function to trigger install
  return async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);

    deferredPrompt = null;
    return outcome === 'accepted';
  };
}

/**
 * Check if app is running as PWA (installed)
 */
export function isRunningAsInstalled() {
  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  console.log('[PWA] Running as installed:', isInstalled);
  return isInstalled;
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
  console.log('[PWA] Clearing all caches...');

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('[PWA] All caches cleared');
  }

  // Notify service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
    });
  }
}

/**
 * Helper function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Check online/offline status
 */
export function onOnlineStatusChange(callback) {
  window.addEventListener('online', () => {
    console.log('[PWA] Online');
    callback(true);
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Offline');
    callback(false);
  });

  // Initial status
  callback(navigator.onLine);
}

export default {
  initializePWA,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  setupInstallPrompt,
  isRunningAsInstalled,
  clearAllCaches,
  onOnlineStatusChange,
};
