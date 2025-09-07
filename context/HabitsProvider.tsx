import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../hooks/useNotifications';
import { useUser } from './userProvider';

// Types
export interface Habit {
  id: number;
  userId: number;
  name: string;
  description?: string;
  targetDays: boolean[];
  currentStreak: number;
  longestStreak: number;
  experienceReward: number;
  createdAt: string;
  reminderTime: string;
  completedToday: boolean;
  physical: boolean;
  mental: boolean;
  spiritual: boolean;
  discipline: boolean;
  social: boolean;
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  userId: number;
  completedAt: string;
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'bad';
}

export interface HabitStats {
  habit: {
    id: number;
    name: string;
    currentStreak: number;
    longestStreak: number;
    targetDays: boolean[];
    experienceReward: number;
  };
  stats: {
    totalCompletions: number;
    completionRate: number;
    recentStreak: number;
    moodDistribution: Record<string, number>;
    averageCompletionsPerWeek: number;
  };
}

export interface CreateHabitData {
  name: string;
  description?: string;
  targetDays?: boolean[];
  experienceReward?: number;
  reminderTime?: string;
  categories?: boolean[];
}

export interface CompleteHabitData {
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'bad';
}

interface HabitsContextType {
  habits: Habit[];
  isLoading: boolean;
  refreshHabits: () => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<Habit>;
  updateHabit: (id: number, data: Partial<CreateHabitData>) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  completeHabit: (id: number, data?: CompleteHabitData) => Promise<any>;
  getHabitStats: (id: number) => Promise<HabitStats>;
  getHabitCompletions: (id: number, limit?: number, offset?: number) => Promise<HabitCompletion[]>;
  recordRelapse: (reason: string) => Promise<void>;
  getRelapses: () => Promise<any[]>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

// API Configuration
const API_BASE_URL = 'https://api.piru.app/api';

// API Helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        console.warn('Could not parse error response:', parseError);
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      throw error;
    }

    return response.json();
  } catch (fetchError) {
    // Handle network errors or other fetch issues
    if (fetchError instanceof Error) {
      throw fetchError;
    } else {
      throw new Error(`Network error: ${String(fetchError)}`);
    }
  }
};

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleHabitNotification, updateHabitNotification, rescheduleHabitNotification, cancelHabitNotification } = useNotifications();
  const { refreshUserData, user, setLevelUpData } = useUser();

  // Refresh habits list
  const refreshHabits = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall('/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error refreshing habits:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create new habit
  const createHabit = async (data: CreateHabitData): Promise<Habit> => {
    try {
      const response = await apiCall('/habits', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const newHabit = response.data;
      setHabits(prev => [newHabit, ...prev]);
      
      // Programar notificaciones para el nuevo hábito
      if (data.targetDays && data.reminderTime) {
        try {
          await scheduleHabitNotification(
            newHabit.id,
            newHabit.name,
            data.targetDays,
            data.reminderTime
          );
        } catch (notificationError) {
          console.error('Error programando notificaciones:', notificationError);
          // No lanzar error aquí para no fallar la creación del hábito
        }
      }
      
      return newHabit;
    } catch (error) {
      console.error('Error creating habit:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      throw error;
    }
  };

  // Update habit
  const updateHabit = async (id: number, data: Partial<CreateHabitData>) => {
    try {
      const response = await apiCall(`/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      // Update local state with the returned updated habit data
      if (response.data) {
        setHabits(prev => prev.map(habit => 
          habit.id === id ? { ...habit, ...response.data } : habit
        ));
      }
      
      // Actualizar notificaciones si se modificaron días u horario
      if (data.targetDays || data.reminderTime) {
        try {
          const habit = habits.find(h => h.id === id);
          if (habit) {
            const updatedDays = data.targetDays || habit.targetDays;
            const updatedTime = data.reminderTime || habit.reminderTime;
            const updatedName = data.name || habit.name;
            
            await updateHabitNotification(
              id,
              updatedName,
              updatedDays,
              updatedTime
            );
          }
        } catch (notificationError) {
          console.error('Error actualizando notificaciones:', notificationError);
          // No lanzar error aquí para no fallar la actualización del hábito
        }
      }
    } catch (error) {
      console.error('Error updating habit:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  };

  // Delete habit
  const deleteHabit = async (id: number) => {
    try {
      console.log(`Iniciando eliminación del hábito ${id}`);
      
      // Primero cancelar las notificaciones antes de eliminar el hábito
      // Esto asegura que las notificaciones se cancelen incluso si la eliminación del hábito falla
      try {
        console.log(`Cancelando notificaciones para hábito ${id}`);
        await cancelHabitNotification(id);
        console.log(`Notificaciones canceladas exitosamente para hábito ${id}`);
      } catch (notificationError) {
        console.error('Error cancelando notificaciones durante eliminación:', notificationError);
        // Continuar con la eliminación del hábito aunque las notificaciones fallen
      }
      
      // Eliminar el hábito del servidor
      await apiCall(`/habits/${id}`, {
        method: 'DELETE'
      });
      
      // Remove from local state
      setHabits(prev => prev.filter(habit => habit.id !== id));
      
      console.log(`Hábito ${id} eliminado exitosamente`);
    } catch (error) {
      console.error('Error deleting habit:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  };

  // Complete habit
  const completeHabit = async (id: number, data?: CompleteHabitData) => {
    try {
      const response = await apiCall(`/habits/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(data || {})
      }) as {
        data: {
          newStreak: number;
          newLongestStreak: number;
          experienceGained: number;
          newUserExperience: number;
          newUserLevel: number;
          leveledUp: boolean;
          physicalPoints: number;
          mentalPoints: number;
          spiritualPoints: number;
          disciplinePoints: number;
          socialPoints: number;
        }
      };
      console.log(response.data);
      // Update local habit state with new streak
      setHabits(prev => prev.map(habit => 
        habit.id === id ? { 
          ...habit, 
          currentStreak: response.data.newStreak,
          longestStreak: response.data.newLongestStreak,
          completedToday: true
        } : habit
      ));
      
      // Check if user leveled up and trigger level up detection
      console.log('🎯 Level up check:', {
        leveledUp: response.data.leveledUp,
        userLevel: user?.level,
        newUserLevel: response.data.newUserLevel,
        experienceGained: response.data.experienceGained
      });
      
      if (response.data.leveledUp && user) {
        const oldLevel = user.level;
        const newLevel = response.data.newUserLevel;
        
        console.log('🎉 LEVEL UP DETECTED!', { oldLevel, newLevel });
        
        // Arena names mapping
        const arenaNames = [
          'Aldea Pacífica',
          'Bosque Encantado', 
          'Puente Ancestral',
          'Valle Místico',
          'Castillo Otoñal',
          'Torre del Dragón',
          'Ciudadela Celestial'
        ];
        
        // Arena images mapping
        const arenaImages = [
          require('../assets/images/nivel1.jpg'),
          require('../assets/images/nivel2.jpg'),
          require('../assets/images/nivel3.jpg'),
          require('../assets/images/nivel4.jpg'),
          require('../assets/images/nivel5.jpg'),
          require('../assets/images/nivel6.jpg'),
          require('../assets/images/nivel7.jpg')
        ];
        
        const levelUpData = {
          oldLevel,
          newLevel,
          arenaName: arenaNames[newLevel - 1] || 'Arena Desconocida',
          arenaImage: arenaImages[newLevel - 1] || require('../assets/images/nivel1.jpg')
        };
        
        setLevelUpData(levelUpData);
      }
      
      // Update user data
      try {
        await refreshUserData();
      } catch (userUpdateError) {
        console.error('Error refreshing user data:', userUpdateError);
      }
      
      // Reprogramar notificaciones después de completar un hábito (especialmente útil en Android)
      try {
        const habit = habits.find(h => h.id === id);
        if (habit) {
          await rescheduleHabitNotification(
            habit.id,
            habit.name,
            habit.targetDays,
            habit.reminderTime
          );
        }
      } catch (notificationError) {
        console.error('Error reprogramando notificaciones:', notificationError);
        // No lanzar error aquí para no fallar la completación del hábito
      }
      
      return response.data;
    } catch (error) {
      console.error('Error completing habit:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  };

  // Get habit statistics
  const getHabitStats = async (id: number): Promise<HabitStats> => {
    try {
      const response = await apiCall(`/habits/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting habit stats:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  };

  // Get habit completions
  const getHabitCompletions = async (id: number, limit: number = 30, offset: number = 0): Promise<HabitCompletion[]> => {
    try {
      const response = await apiCall(`/habits/${id}/completions?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error getting habit completions:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  };

  const recordRelapse = async (reason: string) => {
    try {
      const response = await apiCall('/habits/relapse', {
        method: 'POST',
        body: JSON.stringify({ 
          relapseReason: reason, 
          relapseDate: new Date().toISOString() 
        })
      });
      console.log(response);
      return response.data;
  }
  catch (error) {
    // Create a safe error object that can be serialized
    const safeError = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      status: (error as any).status,
      statusText: (error as any).statusText,
      name: error instanceof Error ? error.name : 'Unknown',
      // Convert error to string to avoid circular references
      errorString: error instanceof Error ? error.toString() : String(error)
    };
    
    console.error('Error recording relapse:', safeError);
    throw error;
  }
  }

  const getRelapses = async () => {
    try {
      const response = await apiCall('/habits/relapses');
      return response.data;
    } catch (error) {
      console.error('Error getting relapses:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  const value: HabitsContextType = {
    habits,
    isLoading,
    refreshHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    getHabitStats,
    getHabitCompletions,
    recordRelapse,
    getRelapses,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
};

// Hook to use the habits context
export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};
