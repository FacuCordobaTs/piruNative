import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ImageBackground, SafeAreaView, useWindowDimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { T } from '../components/T';
import { useUser } from '../context/userProvider';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Glassmorphism card component with blur effect
const BlurredCard = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cardRef = useRef<View>(null);
  const { width, height } = useWindowDimensions();

  return (
    <View
      ref={cardRef}
      onLayout={() => {
        cardRef.current?.measure((fx, fy, cardWidth, cardHeight, px, py) => {
          setLayout({ x: px, y: py, width: cardWidth, height: cardHeight });
        });
      }}
      style={[styles.blurredCardContainer, style]}
    >
      <ImageBackground
        source={require('../assets/images/landscape.jpg')}
        style={[
          styles.blurredImage,
          {
            top: -layout.y,
            left: -layout.x,
            width: width,
            height: height,
          },
        ]}
        blurRadius={15}
      />
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blurredCardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  blurredImage: {
    position: 'absolute',
    zIndex: -1,
  },
  contentOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 24,
  },
  mainCard: {
    width: '100%',
    maxWidth: 400,
  },
  
  ironButton: {
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ironButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ironButtonBorder: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 3,
    borderTopColor: '#4a4a4a',
    borderLeftColor: '#4a4a4a',
    borderRightColor: '#1a1a1a',
    borderBottomColor: '#1a1a1a',
    shadowColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },
  
  ironButtonDisabled: {
    opacity: 1,
  },
});;

export default function LoginScreen({navigation}: any) {
  const { login, isLoading, isAuthenticated, user } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.completedQuiz) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('Quiz');
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await login();
      if (user?.completedQuiz) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('Quiz');
      }
        
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert(
        'Error de Autenticación', 
        'No se pudo completar el inicio de sesión con Google. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      
      {/* Background Image */}
      <ImageBackground
        source={require('../assets/images/landscape.jpg')}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />
      
      {/* Overlay */}
      <View className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <SafeAreaView className="flex-1 relative z-10">
        {/* Header with back button */}
        <View className="pt-12 px-5 pb-5">
          <TouchableOpacity 
            onPress={handleBackPress} 
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 justify-center items-center p-4">
          <BlurredCard style={styles.mainCard}>
            {/* Header with shield icon */}
            <View className="flex-row items-center justify-center mb-3">
              <Ionicons name="shield-checkmark" size={16} color="rgba(255, 255, 255, 0.9)" />
              <T className="text-xs uppercase tracking-widest text-white/90 font-medium ml-2">
                SINCRONIZA TU PROGRESO
              </T>
            </View>

            {/* Title */}
            <T className="text-2xl font-cinzel-bold text-white text-center mb-2">
              Guarda tu progreso
            </T>
            
            {/* Description */}
            <T className="text-sm text-white/85 text-center mb-6">
              Sincroniza tu aventura en todos tus dispositivos y nunca pierdas tu progreso.
            </T>

            {/* Google Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isSigningIn || isLoading}
              className="w-full flex-row items-center justify-center"
              activeOpacity={0.9}
              style={{
                paddingBottom: 16,
                borderRadius: 12,
                overflow: 'hidden',
                opacity: (isSigningIn || isLoading) ? 0.7 : 1,
              }}
            >
              <View style={{
                width: '100%',
                paddingHorizontal: 6,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 3,
                borderTopColor: '#FFED4A',
                borderLeftColor: '#FFED4A',
                borderRightColor: '#B8860B',
                borderBottomColor: '#B8860B',
                shadowColor: '#DAA520',
                backgroundColor: '#DAA520',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
                elevation: 8,
              }}>
                {isSigningIn || isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#1a1a1a" />
                    <T className="text-slate-900 font-cinzel-bold ml-3 text-center">
                      Conectando...
                    </T>
                  </View>
                ) : (
                  <T className="text-slate-900 font-cinzel-bold ml-3 text-center">
                    Continuar con Google
                  </T>
                )}
              </View>
            </TouchableOpacity>

            {/* Benefits text */}
            <T className="text-xs text-white/75 text-center mb-5">
              Respaldo seguro • Compite con tu Guild • Progreso en la nube
            </T>
          </BlurredCard>
        </View>
      </SafeAreaView>
    </View>
  );
}