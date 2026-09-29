export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser ini tidak mendukung notifikasi desktop/push.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Gagal meminta izin notifikasi:', err);
    return false;
  }
}

export function isPushSupported(): boolean {
  return 'Notification' in window;
}

export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function showSystemNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (err) {
      console.warn('Gagal menampilkan notifikasi sistem:', err);
    }
  }
}
