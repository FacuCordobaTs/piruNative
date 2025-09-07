import React, { useState } from 'react';
import { View,SafeAreaView, TouchableOpacity, Switch, ScrollView, Alert, ImageBackground, Platform, Linking } from 'react-native';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  User, 
  Moon, 
  Globe, 
  Trash2,
  Crown,
  Heart,
  Zap,
  CreditCard
} from 'lucide-react-native';
import { T } from '../components/T';
import { useUser } from '../context/userProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const backgroundImage = require('../assets/images/medieval-house-bg.jpg');

const GlassCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
  <View style={[{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    marginBottom: 16,
  }, style]}>
    {children}
  </View>
);

const SettingItem = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onPress, 
  showSwitch = false, 
  switchValue = false, 
  onSwitchChange,
  showArrow = true,
  danger = false 
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showArrow?: boolean;
  danger?: boolean;
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.7}
    disabled={showSwitch}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
    }}
  >
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    }}>
      <Icon size={20} color={danger ? '#ef4444' : 'white'} />
    </View>
    
    <View style={{ flex: 1 }}>
      <T className={`font-cinzel-bold text-white ${danger ? 'text-red-400' : ''}`}>
        {title}
      </T>
      {subtitle && (
        <T className="text-white/60 text-sm mt-1">
          {subtitle}
        </T>
      )}
    </View>
    
    {showSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#f59e0b' }}
        thumbColor={switchValue ? '#ffffff' : '#f4f3f4'}
      />
    ) : showArrow && (
      <ArrowLeft size={20} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen({navigation} : any) {
  const { user, logout, isSuscribed } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    );
  };

  const handleUnsubscribe = async () => {
    try {
      // Get current customer info to check subscription status
      const customerInfo = await Purchases.getCustomerInfo();
      
      if (customerInfo.entitlements.active["entl5c603c8e6c"]) {
        // User has an active subscription, show cancellation options
        Alert.alert(
          'Cancelar Suscripción',
          '¿Estás seguro de que quieres cancelar tu suscripción? Podrás seguir usando la aplicación hasta el final del período de facturación actual.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Cancelar Suscripción', 
              style: 'destructive',
              onPress: async () => {
                try {
                  // Show instructions for subscription management
                  Alert.alert(
                    'Gestionar Suscripción',
                    'Para cancelar tu suscripción:\n\n' +
                    '📱 iOS: Ve a Configuración > Apple ID > Suscripciones\n' +
                    '🤖 Android: Ve a Google Play Store > Suscripciones\n\n' +
                    'Tu suscripción se cancelará al final del período actual.',
                    [
                      { text: 'Entendido' },
                      { 
                        text: 'Abrir Configuración', 
                        onPress: () => {
                          // Try to open device subscription settings
                          if (Platform.OS === 'ios') {
                            // iOS doesn't have a direct way to open subscription settings
                            Alert.alert(
                              'Configuración de iOS',
                              'Ve a Configuración > Apple ID > Suscripciones para gestionar tu suscripción.'
                            );
                          } else {
                            // For Android, try to open Play Store subscriptions
                            Linking.openURL('https://play.google.com/store/account/subscriptions');
                          }
                        }
                      }
                    ]
                  );
                } catch (error) {
                  console.error('Error handling subscription cancellation:', error);
                  Alert.alert(
                    'Error',
                    'No se pudo procesar la solicitud. Por favor, contacta con soporte.',
                    [{ text: 'OK' }]
                  );
                }
              }
            }
          ]
        );
      } else {
        // User doesn't have an active subscription
        Alert.alert(
          'Sin Suscripción Activa',
          'No tienes una suscripción activa para cancelar.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      Alert.alert(
        'Error',
        'No se pudo verificar el estado de tu suscripción. Por favor, contacta con soporte.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar Cuenta', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Here you would call the API to delete the user account
              await AsyncStorage.clear();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error deleting account:', error);
            }
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Gestionar Suscripción',
      '¿Qué te gustaría hacer con tu suscripción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ver Detalles', 
          onPress: async () => {
            try {
              // Show subscription details and management options
              Alert.alert(
                'Detalles de Suscripción',
                'Para gestionar tu suscripción:\n\n' +
                '📱 iOS: Ve a Configuración > Apple ID > Suscripciones\n' +
                '🤖 Android: Ve a Google Play Store > Suscripciones\n\n' +
                'Aquí podrás ver el estado, cambiar planes o cancelar.',
                [
                  { text: 'Entendido' },
                  { 
                    text: 'Abrir Configuración', 
                    onPress: () => {
                      if (Platform.OS === 'ios') {
                        Alert.alert(
                          'Configuración de iOS',
                          'Ve a Configuración > Apple ID > Suscripciones para gestionar tu suscripción.'
                        );
                      } else {
                        Linking.openURL('https://play.google.com/store/account/subscriptions');
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error handling subscription management:', error);
              Alert.alert(
                'Error',
                'No se pudo procesar la solicitud. Por favor, contacta con soporte.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginTop: 32,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
              
              <T className="font-cinzel-bold text-white text-lg">
                Configuración
              </T>
            </View>

            <ScrollView 
              style={{ flex: 1, padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* User Info */}
              <GlassCard>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Crown size={32} color="#f59e0b" />
                  </View>
                  <T className="font-cinzel-bold text-white text-lg">
                    {user?.name || 'Héroe'}
                  </T>
                  <T className="text-white/60 text-sm">
                    Nivel {user?.level} • {user?.email}
                  </T>
                </View>
              </GlassCard>

              {/* Notifications */}
              <GlassCard>
                <T className="font-cinzel-bold text-white text-lg mb-4">
                  Notificaciones
                </T>
                <SettingItem
                  icon={Bell}
                  title="Notificaciones Push"
                  subtitle="Recibe recordatorios de tus hábitos"
                  showSwitch={true}
                  switchValue={notificationsEnabled}
                  onSwitchChange={setNotificationsEnabled}
                  showArrow={false}
                />
              </GlassCard>

              {/* Preferences */}
              <GlassCard>
                <T className="font-cinzel-bold text-white text-lg mb-4">
                  Preferencias
                </T>
                <SettingItem
                  icon={Moon}
                  title="Modo Oscuro"
                  subtitle="Cambiar tema de la aplicación"
                  showSwitch={true}
                  switchValue={darkMode}
                  onSwitchChange={setDarkMode}
                  showArrow={false}
                />
                <SettingItem
                  icon={Globe}
                  title="Idioma"
                  subtitle="Español"
                  onPress={() => Alert.alert('Idioma', 'Función en desarrollo')}
                />
              </GlassCard>

              {/* Support */}
              <GlassCard>
                <T className="font-cinzel-bold text-white text-lg mb-4">
                  Soporte
                </T>
                <SettingItem
                  icon={HelpCircle}
                  title="Ayuda y Soporte"
                  subtitle="Obtén ayuda con la aplicación"
                  onPress={() => Alert.alert('Ayuda', 'Función en desarrollo')}
                />
                <SettingItem
                  icon={Shield}
                  title="Privacidad y Seguridad"
                  subtitle="Gestiona tu privacidad"
                  onPress={() => Alert.alert('Privacidad', 'Función en desarrollo')}
                />
              </GlassCard>

              {/* Account Actions */}
              <GlassCard>
                <T className="font-cinzel-bold text-white text-lg mb-4">
                  Cuenta
                </T>
                <SettingItem
                  icon={User}
                  title="Editar Perfil"
                  subtitle="Cambiar información personal"
                  onPress={() => Alert.alert('Editar Perfil', 'Función en desarrollo')}
                />
                {isSuscribed && (
                  <SettingItem
                    icon={CreditCard}
                    title="Gestionar Suscripción"
                    subtitle="Ver detalles y cambiar planes"
                    onPress={handleCancelSubscription}
                  />
                )}
                {isSuscribed && (
                  <SettingItem
                    icon={Trash2}
                    title="Cancelar Suscripción"
                    subtitle="Cancelar tu suscripción activa"
                    onPress={handleUnsubscribe}
                    danger={true}
                  />
                )}
                <SettingItem
                  icon={LogOut}
                  title="Cerrar Sesión"
                  subtitle="Salir de tu cuenta"
                  onPress={handleSignOut}
                  danger={true}
                />
              </GlassCard>

              {/* Danger Zone */}
              <GlassCard style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <T className="font-cinzel-bold text-red-400 text-lg mb-4">
                  Zona de Peligro
                </T>
                <SettingItem
                  icon={Trash2}
                  title="Eliminar Cuenta"
                  subtitle="Eliminar permanentemente tu cuenta y datos"
                  onPress={handleDeleteAccount}
                  danger={true}
                />
              </GlassCard>

              {/* App Info */}
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <T className="text-white/40 text-sm">
                  Piru v1.0.0
                </T>
                <T className="text-white/40 text-xs mt-1">
                  Desarrollado con ❤️ para tu crecimiento personal
                </T>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
