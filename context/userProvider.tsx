import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import Purchases from 'react-native-purchases';

// Types
export interface User {
  id: number;
  email: string;
  name?: string;
  age?: number;
  level: number;
  experience: number;
  experienceToNext: number;
  longestStreak: number;
  avatar?: string;
  physicalPoints: number,
  mentalPoints: number,
  spiritualPoints: number,
  disciplinePoints: number,
  socialPoints: number,
  lastRelapse: Date | null,
  completedQuiz: boolean,
  referalCode: string | null,
  globalHabitsStreak: number,
  class?: string,
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  arenaName: string;
  arenaImage: any;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  reminderTime: string;
  language: string;
}

export interface UserStats {
  level: number;
  experience: number;
  experienceToNext: number;
  currentStreak: number;
  longestStreak: number;
  totalHabits: number;
  activeHabits: number;
  totalExperienceFromHabits: number;
  progressToNextLevel: number;
}

interface UserContextType {
  user: User | null;
  currentStreak: number | null;
  settings: UserSettings | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  completeQuiz: (data: Partial<User>) => Promise<void>;
  updateUserSettings: (data: Partial<UserSettings>) => Promise<void>;
  addExperience: (experience: number) => Promise<void>;
  updateStreak: (currentStreak: number) => Promise<void>;
  recordRelapse: () => Promise<void>;
  getLeaderboard: () => Promise<any>;
  handleOAuthRedirect: (token: string) => Promise<void>;
  isSuscribed: boolean;
  handleReferal: (referalCode: string) => Promise<any>;
  levelUpData: LevelUpData | null;
  clearLevelUpData: () => void;
  setLevelUpData: (data: LevelUpData | null) => void;
  updateClass: (userClass: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const isAuthenticated = !!token && !!user;
  const [isSuscribed, setIsSuscribed] = useState(false);

  // Initialize app - check for existing token
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login
  const login = async () => {
    try {
      console.log('🚀 Starting OAuth login...');
      setIsLoading(true);
      
      // Configure redirect URI for React Native
      // Detect if we're in Expo Go or production build
      const redirectUri  = 'piru://';                // Production app scheme
      
      console.log('📍 Redirect URI:', redirectUri);
      
      // Start OAuth flow
      const authUrl = `${API_BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
      console.log('🌐 Auth URL:', authUrl);
      
      console.log('📱 Opening WebBrowser...');
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('📱 WebBrowser result:', result);
      
      if (result.type === 'success' && result.url) {
        console.log('✅ OAuth success, URL:', result.url);
        // Extract token from URL
        const url = new URL(result.url);
        const tokenParam = url.searchParams.get('token');
        console.log('🔑 Token from URL:', tokenParam ? 'Present' : 'Missing');
        
        if (tokenParam) {
          console.log('💾 Saving token to AsyncStorage...');
          await AsyncStorage.setItem('authToken', tokenParam);
          setToken(tokenParam);
          console.log('🔄 Refreshing user data...');
          await refreshUserData();
          console.log('✅ Login completed successfully');
          // router.replace('/(tabs)/home');
        } else {
          console.error('❌ No token received from OAuth');
          throw new Error('No token received from OAuth');
        }
      } else if (result.type === 'cancel') {
        console.log('❌ OAuth cancelled by user');
      } else {
        console.error('❌ OAuth failed:', result.type);
        throw new Error('OAuth failed');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth redirect with token
  const handleOAuthRedirect = async (token: string) => {
    try {
      console.log('🔄 handleOAuthRedirect called with token:', token ? 'Present' : 'Missing');
      console.log('💾 Saving token to AsyncStorage...');
      await AsyncStorage.setItem('authToken', token);
      console.log('💾 Token saved to AsyncStorage');
      setToken(token);
      console.log('🔄 Token set in state');
      console.log('🔄 Refreshing user data...');
      await refreshUserData();
      console.log('✅ handleOAuthRedirect completed successfully');

      console.log('User data:', user);
    } catch (error) {
      console.error('💥 Error in handleOAuthRedirect:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setSettings(null);
      setStats(null);
      // router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      const [profileResponse, statsResponse] = await Promise.all([
        apiCall('/user/profile'),
        apiCall('/user/stats')
      ]);

      setIsSuscribed(true);
      setUser(profileResponse.data.user);
      setSettings(profileResponse.data.settings);
      setStats(statsResponse.data);
      if (user?.lastRelapse) {
        const lastRelapseDate = new Date(user.lastRelapse);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - lastRelapseDate.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        setCurrentStreak(days);
      }
      const customerInfo = await Purchases.getCustomerInfo();
      // setIsSuscribed(user?.referalCode !== null || typeof customerInfo.entitlements.active["Suscripción Piru"] !== "undefined");

    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If token is invalid, logout
      if (error instanceof Error && error.message.includes('401')) {
        await logout();
      }
    }
  };

  // Update user profile
  const completeQuiz = async (data: Partial<User>) => {
    try {
      await apiCall('/user/complete-quiz', {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          physicalPoints: 10,
          mentalPoints:  10,
          spiritualPoints:  10,
          disciplinePoints:   10,
          socialPoints:   10,
          completedQuiz: true,
        })
      });
      await refreshUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Update user settings
  const updateUserSettings = async (data: Partial<UserSettings>) => {
    try {
      await apiCall('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await refreshUserData();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  // Add experience points
  const addExperience = async (experience: number) => {
    try {
      const response = await apiCall('/user/experience', {
        method: 'POST',
        body: JSON.stringify({ experience })
      });
      
      // Check if user leveled up
      if (response.data.leveledUp && user) {
        const oldLevel = user.level;
        const newLevel = response.data.newLevel;
        
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
        
        const levelUpData: LevelUpData = {
          oldLevel,
          newLevel,
          arenaName: arenaNames[newLevel - 1] || 'Arena Desconocida',
          arenaImage: arenaImages[newLevel - 1] || require('../assets/images/nivel1.jpg')
        };
        
        setLevelUpData(levelUpData);
      }
      
      // Update local state immediately for better UX
      if (user && stats) {
        setUser(prev => prev ? {
          ...prev,
          experience: response.data.newExperience,
          level: response.data.newLevel,
          experienceToNext: response.data.newExperienceToNext
        } : null);
        
        setStats(prev => prev ? {
          ...prev,
          experience: response.data.newExperience,
          level: response.data.newLevel,
          experienceToNext: response.data.newExperienceToNext
        } : null);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  };

  // Update user streak
  const updateStreak = async (currentStreak: number) => {
    try {
      const response = await apiCall('/user/streak', {
        method: 'PUT',
        body: JSON.stringify({ currentStreak })
      });
      
      // Update local state immediately
      if (user && stats) {
        setUser(prev => prev ? {
          ...prev,
          currentStreak: response.data.currentStreak,
          longestStreak: response.data.longestStreak
        } : null);
        
        setStats(prev => prev ? {
          ...prev,
          currentStreak: response.data.currentStreak,
          longestStreak: response.data.longestStreak
        } : null);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  };

  const recordRelapse = async () => {
    setUser(prev => prev ? {
      ...prev,
      lastRelapse: new Date()
    } : null);
  }

  const updateClass = async (userClass: string) => {
    try {
      await apiCall('/user/class', {
        method: 'POST',
        body: JSON.stringify({ class: userClass })
      });
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  const getLeaderboard = async () => {
    const response = await apiCall('/user/leaderboard');
    return response.data;
  }

  const handleReferal = async (referalCode: string) => {
    console.log('handleReferal called with referalCode:', referalCode);
    referalCode = referalCode.toUpperCase();
    setIsSuscribed(true);
    // if (referalCode == 'PIRUBI') {
    //   const response = await apiCall('/user/referal', {
    //     method: 'POST',
    //     body: JSON.stringify({ referalCode })
    //   });
    //   setIsSuscribed(true);
      return{ succes: true, message: 'Referal code applied'};
    // } else {
    //   return { success: false, message: 'Invalid referal code' };
    // }
  }

  // Clear level up data
  const clearLevelUpData = () => {
    setLevelUpData(null);
  };

  const value: UserContextType = {
    user,
    currentStreak,
    settings,
    stats,
    isLoading,
    isAuthenticated,
    token,
    login,
    logout,
    refreshUserData,
    completeQuiz,
    updateUserSettings,
    addExperience,
    updateStreak,
    recordRelapse,
    getLeaderboard,
    handleOAuthRedirect,
    isSuscribed,
    handleReferal,
    levelUpData,
    clearLevelUpData,
    setLevelUpData,
    updateClass,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 