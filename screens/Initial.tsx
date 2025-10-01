import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, ImageBackground, Image, Animated } from 'react-native';
import { useUser } from '../context/userProvider';
import { T } from '../components/T';
import Purchases from 'react-native-purchases';
import { Loader2 } from 'lucide-react-native';
import { AnimatedButton } from '../components/AnimatedButton';

const backgroundLoading = require('../assets/images/loading-screen.jpg');


export default function IndexScreen({navigation}: any) {
  const { user, isLoading } = useUser();
  const [isLoading2, setIsLoading2] = useState(true);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spinAnim.setValue(0);
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isLoading && !user) {
        setIsLoading2(false);
      }

      const customerInfo = await Purchases.getCustomerInfo();
      // const isSuscribed = (user?.referalCode !== null || typeof customerInfo.entitlements.active["Suscripción Piru"] !== "undefined");
      const isSuscribed = true;

      if (user && !isLoading) {
        console.log("user", JSON.stringify(user, null, 2));
        console.log("isSuscribed", isSuscribed);
        if (user?.completedQuiz) {
          if (isSuscribed) {
            navigation.replace('Tabs');
          } else {
            navigation.replace('Pricing');
          }
        } else {
            navigation.replace('Quiz');
          }
        }
    };

    checkUserStatus();
  }, [user, navigation, isLoading]);


  const handleStartJourney = async () => {
    if (user) {
      if (user?.completedQuiz) {
        const customerInfo = await Purchases.getCustomerInfo();
        // const isSuscribed = (user?.referalCode !== null || typeof customerInfo.entitlements.active["Suscripción Piru"] !== "undefined");
        const isSuscribed = true;
        if (isSuscribed) {
          navigation.replace('Tabs');
        } else {
          navigation.replace('Pricing');
        }
      } else {
          navigation.replace('Quiz');
        }
      } else {
      navigation.replace('Login');
    }
  };
  

  return (
    <View className="flex-1 relative">
      {
        (isLoading2 || isLoading) 
        ? 
        (
        <>
        <ImageBackground
        source={backgroundLoading}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
        />
        <SafeAreaView className="flex-1 bg-black/30">
          <View className="flex-1 items-center mt-60  ">
            <View className="items-center space-y-4">
                {/* Logo */}
                <Image
                  source={require('../assets/images/piru-logo-transparente.webp')}
                  style={{ width: 72, height: 72, opacity: 0.95 }}
                  resizeMode="contain"
                />
                {/* Main title */}
                <T className="text-3xl font-cinzel-bold text-white text-center leading-tight">
                  Bienvenido guerrero
                </T>
                
                {/* Description */}
                <T className="text-white/80 font-cinzel-bold text-center w-64">
                  Aguarda un momento mientras preparamos todo para ti
                </T>
              </View>
              <Animated.View
                className='mt-24'
                style={{
                  transform: [
                    {
                      rotate: rotate,
                    },
                  ],
                }}
              >
                <Loader2 size={40} color="white" />
              </Animated.View>
          </View>
        </SafeAreaView>
        </>
        )
        :
        (
          <>           
      {/* Background Image */}
      <ImageBackground
      source={require('../assets/images/welcome-bg.jpg')}
      className="absolute inset-0 h-full w-full"
      resizeMode="cover"
    />
    
    {/* Overlay */}
    <View className="absolute inset-0 bg-black/20" />

    {/* Content */}
    <SafeAreaView className="flex-1 relative z-10">
      <View className="flex-1 justify-center items-center p-4">
        {/* Glassmorphism Card */}
        <View className="w-full max-w-sm p-6 rounded-2xl" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <View className="items-center space-y-4">
            {/* Logo */}
            <Image
              source={require('../assets/images/piru-logo-transparente.webp')}
              style={{ width: 72, height: 72, opacity: 0.95 }}
              resizeMode="contain"
            />
            
            {/* App name */}
            <T className="text-xs uppercase tracking-widest text-white/90 font-medium">
              piru.app
            </T>
            
            {/* Main title */}
            <T className="text-3xl font-cinzel-bold text-white text-center leading-tight">
              Tu camino a la mejor versión de ti comienza ahora
            </T>
            
            {/* Description */}
            <T className="text-white/80 text-sm text-center">
              Combina hábitos, NoFap y progreso RPG para forjar tu leyenda.
            </T>
          </View>

          {/* Start Button */}
          <AnimatedButton
            onPress={handleStartJourney}
          >
                  <T className="text-black font-cinzel-bold text-base text-center">
                  Comenzar
                </T>
          </AnimatedButton>
          
          {/* Subtitle */}
          <T className="mt-3 text-center text-xs text-white">
            Listo para tu aventura
          </T>
        </View>
      </View>
    </SafeAreaView>
    </>
        )
      }
    </View>
  );
}
