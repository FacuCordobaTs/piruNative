import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  requestNotificationPermissions,
  scheduleHabitNotifications,
  cancelHabitNotifications,
  updateHabitNotifications,
  rescheduleHabitNotifications,
  getScheduledNotifications,
  cancelAllNotifications,
  initializeNotifications,
  debugGetAllScheduledNotifications,
  debugGetStoredNotificationIds,
  cleanupOrphanedNotifications,
} from '../utils/notifications';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Inicializar notificaciones al montar el hook
  useEffect(() => {
    const init = async () => {
      try {
        await initializeNotifications();
        const permission = await requestNotificationPermissions();
        setHasPermission(permission);
        setIsInitialized(true);
      } catch (error) {
        console.warn('Error inicializando notificaciones (continuando sin ellas):', error);
        setHasPermission(false);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Programar notificaciones para un nuevo hábito
  const scheduleHabit = async (
    habitId: number,
    name: string,
    daysOfWeek: boolean[],
    time: string
  ) => {
    try {
      if (!hasPermission) {
        const permission = await requestNotificationPermissions();
        if (!permission) {
          Alert.alert(
            'Permisos requeridos',
            'Necesitas permitir las notificaciones para recibir recordatorios de tus hábitos.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurar', onPress: () => requestNotificationPermissions() }
            ]
          );
          return;
        }
        setHasPermission(true);
      }

      const notificationIds = await scheduleHabitNotifications(habitId, name, daysOfWeek, time);
      console.log(`Notificaciones programadas para hábito ${habitId}`);
      return notificationIds;
    } catch (error) {
      console.error('Error programando notificaciones:', error);
      // No mostrar alerta si las notificaciones no están disponibles
      return [];
    }
  };

  // Actualizar notificaciones de un hábito existente
  const updateHabit = async (
    habitId: number,
    name: string,
    daysOfWeek: boolean[],
    time: string
  ) => {
    try {
      const notificationIds = await updateHabitNotifications(habitId, name, daysOfWeek, time);
      console.log(`Notificaciones actualizadas para hábito ${habitId}`);
      return notificationIds;
    } catch (error) {
      console.error('Error actualizando notificaciones:', error);
      return [];
    }
  };

  // Reprogramar notificaciones después de completar un hábito
  const rescheduleHabit = async (
    habitId: number,
    name: string,
    daysOfWeek: boolean[],
    time: string
  ) => {
    try {
      const notificationIds = await rescheduleHabitNotifications(habitId, name, daysOfWeek, time);
      console.log(`Notificaciones reprogramadas para hábito ${habitId}`);
      return notificationIds;
    } catch (error) {
      console.error('Error reprogramando notificaciones:', error);
      return [];
    }
  };

  // Cancelar notificaciones de un hábito
  const cancelHabit = async (habitId: number) => {
    try {
      await cancelHabitNotifications(habitId);
      console.log(`Notificaciones canceladas para hábito ${habitId}`);
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
      Alert.alert('Error', 'No se pudieron cancelar las notificaciones para este hábito.');
      throw error;
    }
  };

  // Obtener todas las notificaciones programadas
  const getScheduled = async () => {
    try {
      return await getScheduledNotifications();
    } catch (error) {
      console.error('Error obteniendo notificaciones programadas:', error);
      return [];
    }
  };

  // Cancelar todas las notificaciones
  const cancelAll = async () => {
    try {
      await cancelAllNotifications();
      console.log('Todas las notificaciones han sido canceladas');
    } catch (error) {
      console.error('Error cancelando todas las notificaciones:', error);
      Alert.alert('Error', 'No se pudieron cancelar todas las notificaciones.');
      throw error;
    }
  };

  // Solicitar permisos manualmente
  const requestPermissions = async () => {
    try {
      const permission = await requestNotificationPermissions();
      setHasPermission(permission);
      return permission;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  };

  return {
    isInitialized,
    hasPermission,
    scheduleHabitNotification: scheduleHabit,
    updateHabitNotification: updateHabit,
    rescheduleHabitNotification: rescheduleHabit,
    cancelHabitNotification: cancelHabit,
    getScheduled,
    cancelAll,
    requestPermissions,
    // Debug functions
    debugGetAllScheduledNotifications,
    debugGetStoredNotificationIds,
    cleanupOrphanedNotifications,
  };
};
