import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración global de notificaciones
export const NOTIFICATION_CONFIG = {
  // Configuración del canal de notificaciones para Android
  androidChannel: {
    id: 'habit-reminders',
    name: 'Recordatorios de Hábitos',
    description: 'Notificaciones para recordar tus hábitos diarios',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  },
  
  // Configuración de las notificaciones
  habitReminder: {
    title: '¡Es hora de tu hábito! 🎯',
    body: 'No olvides completar tu hábito diario',
    sound: 'default',
    priority: Notifications.AndroidNotificationPriority.HIGH,
    autoDismiss: false,
  },
  
  // Configuración de permisos
  permissions: {
    alert: true,
    badge: false,
    sound: true,
    criticalAlert: false,
    announcement: false,
  },
};

// Configurar el comportamiento de las notificaciones
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.warn('No se pudo configurar el handler de notificaciones:', error);
}

// Función para configurar el canal de Android
export const setupAndroidChannel = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        NOTIFICATION_CONFIG.androidChannel.id,
        {
          name: NOTIFICATION_CONFIG.androidChannel.name,
          description: NOTIFICATION_CONFIG.androidChannel.description,
          importance: NOTIFICATION_CONFIG.androidChannel.importance,
          vibrationPattern: NOTIFICATION_CONFIG.androidChannel.vibrationPattern,
          lightColor: NOTIFICATION_CONFIG.androidChannel.lightColor,
          sound: NOTIFICATION_CONFIG.androidChannel.sound,
        }
      );
    }
  } catch (error) {
    console.warn('No se pudo configurar el canal de Android:', error);
  }
};

// Función para crear el contenido de una notificación de hábito
export const createHabitNotificationContent = (
  habitName: string,
  habitId: number
): Notifications.NotificationContentInput => ({
  title: NOTIFICATION_CONFIG.habitReminder.title,
  body: `No olvides: ${habitName}`,
  data: { 
    habitId, 
    type: 'habit_reminder',
    timestamp: new Date().toISOString()
  },
  sound: NOTIFICATION_CONFIG.habitReminder.sound,
  priority: NOTIFICATION_CONFIG.habitReminder.priority,
  autoDismiss: NOTIFICATION_CONFIG.habitReminder.autoDismiss,
});

// Función para crear el trigger de una notificación recurrente
export const createHabitNotificationTrigger = (
  hour: number,
  minute: number,
  weekday: number
): Notifications.CalendarTriggerInput => ({
  type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
  hour,
  minute,
  weekday,
  repeats: true,
});
