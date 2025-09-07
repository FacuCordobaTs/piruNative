import { Platform } from 'react-native';

// Intentar importar expo-device, usar fallback si falla
let Device: any;
try {
  Device = require('expo-device');
} catch (error) {
  console.warn('expo-device no disponible, usando fallback');
  Device = {
    isDevice: true, // Asumir que es un dispositivo por defecto
  };
}

// Intentar importar expo-notifications, usar fallback si falla
let Notifications: any;
let setupAndroidChannel: any;
let createHabitNotificationContent: any;
let createHabitNotificationTrigger: any;

try {
  Notifications = require('expo-notifications');
  const config = require('../config/notifications');
  setupAndroidChannel = config.setupAndroidChannel;
  createHabitNotificationContent = config.createHabitNotificationContent;
  createHabitNotificationTrigger = config.createHabitNotificationTrigger;
} catch (error) {
  console.warn('expo-notifications no disponible, usando fallback');
  const fallback = require('../config/notifications-fallback');
  setupAndroidChannel = fallback.setupFallbackAndroidChannel;
  createHabitNotificationContent = fallback.createFallbackNotificationContent;
  createHabitNotificationTrigger = fallback.createFallbackNotificationTrigger;
}

// La configuración del comportamiento se maneja en config/notifications.ts

// Tipos para las notificaciones
export interface HabitNotificationConfig {
  habitId: number;
  name: string;
  daysOfWeek: boolean[]; // [L, M, M, J, V, S, D]
  time: string; // formato "HH:MM"
}

// Solicitar permisos de notificaciones
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    // Verificar que Notifications esté disponible
    if (!Notifications || !Notifications.getPermissionsAsync) {
      console.warn('Notifications no disponible');
      return false;
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no otorgados');
        return false;
      }
      
      // Configurar el canal de notificaciones para Android
      if (setupAndroidChannel) {
        await setupAndroidChannel();
      }
      
      return true;
    } else {
      console.log('Las notificaciones solo funcionan en dispositivos físicos');
      return false;
    }
  } catch (error) {
    console.warn('Error solicitando permisos de notificación:', error);
    return false;
  }
};

// Programar notificaciones para un hábito
export const scheduleHabitNotifications = async (
  habitId: number,
  name: string,
  daysOfWeek: boolean[],
  time: string
): Promise<string[]> => {
  try {
    // Verificar que Notifications esté disponible
    if (!Notifications || !Notifications.scheduleNotificationAsync) {
      console.warn('Notifications no disponible para programar');
      return [];
    }

    // Verificar permisos
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Permisos de notificación no otorgados');
      return [];
    }

    const [hours, minutes] = time.split(':').map(Number);

    // Programar una notificación para cada día seleccionado
    const promises = daysOfWeek.map(async (isSelected, dayIndex) => {
      if (isSelected) {
        // Convertir índice de día (0-6) a formato de expo-notifications (1-7)
        const weekday = dayIndex + 1;
        
        // Crear un trigger específico para este día
        let trigger;
        if (Platform.OS === 'android') {
          // En Android, usar timeInterval trigger ya que calendar no está soportado
          const now = new Date();
          const targetTime = new Date();
          targetTime.setHours(hours, minutes, 0, 0);
          
          // Calcular el próximo día de la semana específico
          const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
          const targetDay = weekday === 7 ? 0 : weekday; // Convertir 7 (Domingo) a 0
          
          // Calcular días hasta el próximo día objetivo
          let daysUntilTarget = (targetDay - currentDay + 7) % 7;
          
          // Si es el mismo día pero ya pasó la hora, programar para la próxima semana
          if (daysUntilTarget === 0 && targetTime <= now) {
            daysUntilTarget = 7;
          }
          
          // Si no es el día objetivo, ajustar la fecha
          if (daysUntilTarget > 0) {
            targetTime.setDate(now.getDate() + daysUntilTarget);
          }
          
          const secondsUntil = Math.floor((targetTime.getTime() - now.getTime()) / 1000);
          
          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntil,
            repeats: false, // No repetir automáticamente
          };
        } else {
          // En iOS, usar calendar trigger
          trigger = createHabitNotificationTrigger(hours, minutes, weekday);
        }
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: createHabitNotificationContent(name, habitId),
          trigger: trigger,
        });

        console.log(`Notificación programada para hábito ${habitId}, día ${weekday}, hora ${time}: ID ${notificationId}`);
        return notificationId;
      }
      return null;
    });

    // Esperar a que todas las notificaciones se programen
    const results = await Promise.all(promises);
    const scheduledIds = results.filter(id => id !== null) as string[];
    
    // Guardar los IDs en AsyncStorage para poder cancelarlos después
    await saveNotificationIds(habitId, scheduledIds);
    
    console.log(`Notificaciones programadas para hábito ${habitId}:`, scheduledIds);
    return scheduledIds;
  } catch (error) {
    console.error('Error programando notificaciones:', error);
    return [];
  }
};

// Cancelar notificaciones de un hábito
export const cancelHabitNotifications = async (habitId: number): Promise<void> => {
  try {
    // Verificar que Notifications esté disponible
    if (!Notifications || !Notifications.cancelScheduledNotificationAsync) {
      console.warn('Notifications no disponible para cancelar');
      return;
    }

    console.log(`Iniciando cancelación de notificaciones para hábito ${habitId}`);
    
    // Obtener IDs guardados en AsyncStorage
    const notificationIds = await getNotificationIds(habitId);
    console.log(`IDs de notificaciones encontrados para hábito ${habitId}:`, notificationIds);
    
    // Cancelar notificaciones usando los IDs guardados
    if (notificationIds.length > 0) {
      const cancelPromises = notificationIds.map(async (id) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
          console.log(`Notificación ${id} cancelada exitosamente`);
        } catch (cancelError) {
          console.warn(`Error cancelando notificación ${id}:`, cancelError);
          // Continuar con las demás notificaciones aunque una falle
        }
      });
      
      await Promise.all(cancelPromises);
    }
    
    // También intentar cancelar por identificador de hábito usando getAllScheduledNotificationsAsync
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      const habitNotifications = allScheduled.filter((notification: any) => 
        notification.content.data && 
        notification.content.data.habitId === habitId
      );
      
      console.log(`Notificaciones programadas encontradas por habitId ${habitId}:`, habitNotifications.length);
      
      if (habitNotifications.length > 0) {
        const cancelByHabitIdPromises = habitNotifications.map(async (notification: any) => {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            console.log(`Notificación ${notification.identifier} cancelada por habitId`);
          } catch (cancelError) {
            console.warn(`Error cancelando notificación ${notification.identifier} por habitId:`, cancelError);
          }
        });
        
        await Promise.all(cancelByHabitIdPromises);
      }
    } catch (getAllError) {
      console.warn('Error obteniendo todas las notificaciones programadas:', getAllError);
    }
    
    // Limpiar los IDs guardados
    await removeNotificationIds(habitId);
    
    console.log(`Proceso de cancelación completado para hábito ${habitId}`);
  } catch (error) {
    console.error('Error cancelando notificaciones:', error);
    throw error; // Re-lanzar el error para que el caller pueda manejarlo
  }
};

// Actualizar notificaciones de un hábito (cancelar y reprogramar)
export const updateHabitNotifications = async (
  habitId: number,
  name: string,
  daysOfWeek: boolean[],
  time: string
): Promise<string[]> => {
  try {
    // Cancelar notificaciones existentes
    await cancelHabitNotifications(habitId);
    
    // Programar nuevas notificaciones
    return await scheduleHabitNotifications(habitId, name, daysOfWeek, time);
  } catch (error) {
    console.error('Error actualizando notificaciones:', error);
    return [];
  }
};

// Función para reprogramar notificaciones después de completar un hábito (especialmente útil en Android)
export const rescheduleHabitNotifications = async (
  habitId: number,
  name: string,
  daysOfWeek: boolean[],
  time: string
): Promise<string[]> => {
  try {
    // En Android, reprogramar las notificaciones para la próxima semana
    if (Platform.OS === 'android') {
      console.log(`Reprogramando notificaciones para hábito ${habitId} en Android`);
      await cancelHabitNotifications(habitId);
      return await scheduleHabitNotifications(habitId, name, daysOfWeek, time);
    }
    
    // En iOS, las notificaciones son recurrentes automáticamente
    console.log(`iOS: Las notificaciones son recurrentes automáticamente para hábito ${habitId}`);
    return [];
  } catch (error) {
    console.error('Error reprogramando notificaciones:', error);
    return [];
  }
};

// Obtener todas las notificaciones programadas
export const getScheduledNotifications = async () => {
  try {
    // Verificar que Notifications esté disponible
    if (!Notifications || !Notifications.getAllScheduledNotificationsAsync) {
      console.warn('Notifications no disponible para obtener programadas');
      return [];
    }
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error obteniendo notificaciones programadas:', error);
    return [];
  }
};

// Limpiar todas las notificaciones programadas
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    // Verificar que Notifications esté disponible
    if (!Notifications || !Notifications.cancelAllScheduledNotificationsAsync) {
      console.warn('Notifications no disponible para cancelar todas');
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas las notificaciones han sido canceladas');
  } catch (error) {
    console.error('Error cancelando todas las notificaciones:', error);
  }
};

// Funciones auxiliares para manejar IDs de notificaciones en AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_IDS_KEY = 'habit_notification_ids';

const saveNotificationIds = async (habitId: number, notificationIds: string[]): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const data = existingData ? JSON.parse(existingData) : {};
    data[habitId] = notificationIds;
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(data));
    console.log(`IDs de notificaciones guardados para hábito ${habitId}:`, notificationIds);
  } catch (error) {
    console.error('Error guardando IDs de notificaciones:', error);
  }
};

const getNotificationIds = async (habitId: number): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (data) {
      const parsedData = JSON.parse(data);
      return parsedData[habitId] || [];
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo IDs de notificaciones:', error);
    return [];
  }
};

const removeNotificationIds = async (habitId: number): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (existingData) {
      const data = JSON.parse(existingData);
      const removedIds = data[habitId] || [];
      delete data[habitId];
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(data));
      console.log(`IDs de notificaciones removidos para hábito ${habitId}:`, removedIds);
    }
  } catch (error) {
    console.error('Error removiendo IDs de notificaciones:', error);
  }
};

// Función para inicializar las notificaciones al abrir la app
export const initializeNotifications = async (): Promise<void> => {
  try {
    await requestNotificationPermissions();
    console.log('Notificaciones inicializadas correctamente');
  } catch (error) {
    console.error('Error inicializando notificaciones:', error);
  }
};

// Función de utilidad para debug - obtener todas las notificaciones programadas
export const debugGetAllScheduledNotifications = async () => {
  try {
    if (!Notifications || !Notifications.getAllScheduledNotificationsAsync) {
      console.warn('Notifications no disponible para debug');
      return [];
    }
    
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('=== DEBUG: Todas las notificaciones programadas ===');
    allScheduled.forEach((notification: any, index: number) => {
      console.log(`Notificación ${index + 1}:`, {
        id: notification.identifier,
        title: notification.content.title,
        body: notification.content.body,
        data: notification.content.data,
        trigger: notification.trigger
      });
    });
    console.log('=== FIN DEBUG ===');
    return allScheduled;
  } catch (error) {
    console.error('Error en debug de notificaciones:', error);
    return [];
  }
};

// Función de utilidad para debug - obtener IDs guardados en AsyncStorage
export const debugGetStoredNotificationIds = async () => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const parsedData = data ? JSON.parse(data) : {};
    console.log('=== DEBUG: IDs de notificaciones guardados ===');
    console.log(JSON.stringify(parsedData, null, 2));
    console.log('=== FIN DEBUG ===');
    return parsedData;
  } catch (error) {
    console.error('Error en debug de IDs guardados:', error);
    return {};
  }
};

// Función para limpiar notificaciones huérfanas (notificaciones sin IDs guardados)
export const cleanupOrphanedNotifications = async (): Promise<void> => {
  try {
    if (!Notifications || !Notifications.getAllScheduledNotificationsAsync) {
      console.warn('Notifications no disponible para limpieza');
      return;
    }

    console.log('Iniciando limpieza de notificaciones huérfanas...');
    
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const storedData = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const storedIds = storedData ? JSON.parse(storedData) : {};
    
    // Obtener todos los IDs guardados
    const allStoredIds = Object.values(storedIds).flat() as string[];
    
    // Encontrar notificaciones que no tienen IDs guardados
    const orphanedNotifications = allScheduled.filter((notification: any) => 
      notification.content.data && 
      notification.content.data.type === 'habit_reminder' &&
      !allStoredIds.includes(notification.identifier)
    );
    
    console.log(`Encontradas ${orphanedNotifications.length} notificaciones huérfanas`);
    
    if (orphanedNotifications.length > 0) {
      const cancelPromises = orphanedNotifications.map(async (notification: any) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Notificación huérfana cancelada: ${notification.identifier} (hábito ${notification.content.data.habitId})`);
        } catch (error) {
          console.warn(`Error cancelando notificación huérfana ${notification.identifier}:`, error);
        }
      });
      
      await Promise.all(cancelPromises);
      console.log('Limpieza de notificaciones huérfanas completada');
    }
  } catch (error) {
    console.error('Error en limpieza de notificaciones huérfanas:', error);
  }
};
