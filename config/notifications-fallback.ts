// Configuración de fallback para cuando expo-notifications no esté disponible
export const NOTIFICATIONS_AVAILABLE = false;

export const createFallbackNotificationContent = () => ({
  title: 'Notificaciones no disponibles',
  body: 'Las notificaciones no están configuradas en este entorno',
});

export const createFallbackNotificationTrigger = () => ({
  seconds: 1,
});

export const setupFallbackAndroidChannel = async () => {
  console.warn('Notificaciones no disponibles - usando fallback');
};

export const requestFallbackPermissions = async (): Promise<boolean> => {
  console.warn('Notificaciones no disponibles - permisos no solicitados');
  return false;
};
