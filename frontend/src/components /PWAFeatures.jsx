import React, { useEffect, useState } from 'react';
import { FiDownload, FiBell, FiWifiOff, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  initializePWA,
  setupInstallPrompt,
  requestNotificationPermission,
  subscribeToPushNotifications,
  isRunningAsInstalled,
  onOnlineStatusChange,
} from '../utils/pwaSetup';

/**
 * PWA Feature Component
 * Provides: Install button, Notifications, Offline status
 */
export default function PWAFeatures() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [triggerInstall, setTriggerInstall] = useState(null);

  useEffect(() => {
    // Initialize PWA
    initializePWA();

    // Check if installed
    setIsInstalled(isRunningAsInstalled());

    // Setup install prompt
    const installHandler = setupInstallPrompt((e) => {
      console.log('Install prompt available');
      setShowInstallButton(true);
      setTriggerInstall(() => async () => {
        e.prompt();
        const { outcome } = await e.userChoice;
        if (outcome === 'accepted') {
          setShowInstallButton(false);
          toast.success('App installed! You can now use it offline.');
        }
      });
    });

    // Listen to online/offline status
    onOnlineStatusChange((online) => {
      setIsOnline(online);
      if (online) {
        toast.success('Back online!', { icon: '📡' });
      } else {
        toast.error('You are offline. Some features may be limited.', {
          icon: <FiWifiOff />,
          duration: 5000,
        });
      }
    });

    // Check notification status
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => {
      // Cleanup
    };
  }, []);

  const handleInstallClick = async () => {
    if (triggerInstall) {
      await triggerInstall();
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);

        // Try to subscribe to push notifications
        try {
          await subscribeToPushNotifications(
            process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
          );
          toast.success('Notifications enabled!');
        } catch (err) {
          console.warn('Push subscription failed:', err);
          toast.success('Notifications enabled! (push not available)');
        }
      } else {
        toast.error('Notification permission denied');
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      toast.error('Failed to enable notifications');
    }
  };

  return (
    <div className="space-y-2">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
          <p className="text-yellow-700 text-sm flex items-center">
            <FiWifiOff className="mr-2" />
            You are offline. Using cached data.
          </p>
        </div>
      )}

      {/* PWA Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Install Button */}
        {showInstallButton && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            title="Install Signatura as an app"
          >
            <FiDownload className="mr-2" />
            Install App
          </button>
        )}

        {/* Notifications Button */}
        {!notificationsEnabled && (
          <button
            onClick={handleEnableNotifications}
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
            title="Enable push notifications"
          >
            <FiBell className="mr-2" />
            Enable Notifications
          </button>
        )}

        {/* Status Indicator */}
        {isInstalled && (
          <div className="flex items-center text-green-600 px-4 py-2 text-sm font-medium">
            <FiDownload className="mr-2" />
            App Installed
          </div>
        )}

        {notificationsEnabled && (
          <div className="flex items-center text-green-600 px-4 py-2 text-sm font-medium">
            <FiBell className="mr-2" />
            Notifications On
          </div>
        )}

        {isOnline && (
          <div className="flex items-center text-green-600 px-4 py-2 text-sm font-medium">
            <FiRefreshCw className="mr-2" />
            Online
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Simplified PWA Install Button (for headers, etc)
 */
export function PWAInstallButton() {
  const [showButton, setShowButton] = useState(false);
  const [triggerInstall, setTriggerInstall] = useState(null);

  useEffect(() => {
    setupInstallPrompt((e) => {
      setShowButton(true);
      setTriggerInstall(() => async () => {
        e.prompt();
        const { outcome } = await e.userChoice;
        if (outcome === 'accepted') {
          setShowButton(false);
          toast.success('App installed!');
        }
      });
    });
  }, []);

  if (!showButton) return null;

  return (
    <button
      onClick={triggerInstall}
      className="flex items-center bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition"
      title="Install Signatura as an app"
    >
      <FiDownload className="mr-2" />
      Install
    </button>
  );
}

/**
 * Offline Indicator
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    onOnlineStatusChange(setIsOnline);
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-2">
      <p className="text-red-700 text-xs flex items-center">
        <FiWifiOff className="mr-1" size={14} />
        Offline Mode
      </p>
    </div>
  );
}
