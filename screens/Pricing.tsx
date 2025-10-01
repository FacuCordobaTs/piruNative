import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Animated, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { T } from '../components/T';
import Purchases, { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import { useUser } from '../context/userProvider';
import { AnimatedButton } from '../components/AnimatedButton';

// Import images
const backgroundImage = require('../assets/images/pricing-landscape.jpg');

// Custom icons using emoji
const CrownIcon = () => <Text style={styles.icon}>👑</Text>;
const ClockIcon = () => <Text style={styles.icon}>⏰</Text>;
const ZapIcon = () => <Text style={styles.icon}>⚡</Text>;
const ShieldIcon = () => <Text style={styles.icon}>🛡️</Text>;

// Glassmorphism card component
const GlassCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
  <View style={[styles.glassCard, style]}>
    {children}
  </View>
);

// Animated star component
const AnimatedStar = ({ delay, duration, left, top }: { delay: number, duration: number, left: number, top: number }) => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timer = setTimeout(() => animate(), delay * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          opacity,
          left: `${left}%`,
          top: `${top}%`,
        },
      ]}
    />
  );
};

// Feature item component
const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureDot} />
    <T className="text-sm text-white/90">{text}</T>
  </View>
);

export default function PricingScreen({navigation}: any) {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const { handleReferal } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getOfferings();
  }, []);


  useEffect(() => {
    const checkSubscription = async () => {
      const customerInfo = await Purchases.getCustomerInfo();
      if (typeof customerInfo.entitlements.active["Suscripción Piru"] !== "undefined") {
        navigation.replace('Tabs');
      }
    }
    checkSubscription();
  }, []);

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    setOfferings(offerings);
  }


  const handleSuscribe = async (pkg: PurchasesPackage) => {
    console.log("pkg", JSON.stringify(pkg, null, 2));
    setIsLoading(true);
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    console.log("customerInfo", JSON.stringify(customerInfo, null, 2));
    if (typeof customerInfo.entitlements.active["Suscripción Piru"] !== "undefined") {
      navigation.replace('Tabs');  
    }
  };

  const handleUploadReferalCode = async (referalCode: string) => {
    try {
      setIsLoading(true);
      const response = await handleReferal(referalCode);
      console.log("response", JSON.stringify(response, null, 2));

      if (response.success) {
        navigation.replace('Tabs');
      }
      else {
        Alert.alert(response.message);
      }
    } catch (error) {
      console.error("Error uploading referal code:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Animated stars background */}
      <View style={StyleSheet.absoluteFillObject}>
        {Array.from({ length: 50 }).map((_, i) => (
           <AnimatedStar
             key={i}
             delay={Math.random() * 3}
             duration={40 + Math.random() * 4}
             left={Math.random() * 100}
             top={Math.random() * 100}
           />
         ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <T className="text-white text-2xl font-cinzel-bold mb-2 text-center">
              Oferta Especial de Lanzamiento
            </T>
            <T className="text-white/80 text-lg text-center">
              Tu transformación comienza ahora
            </T>
          </View>

          {/* Discount card */}
          <GlassCard style={styles.discountCard}>
            <View style={styles.discountContent}>
              <View style={styles.discountHeader}>
                <ZapIcon />
                <T className="text-white text-sm font-medium">DESCUENTO EXCLUSIVO</T>
              </View>
              <T className="text-white text-3xl font-bold mb-2">70% OFF</T>
              <T className="text-white/90 text-sm">Solo para los primeros 50 usuarios</T>
            </View>
          </GlassCard>


          {/* Premium card - Updated structure */}
          {offerings?.current?.availablePackages?.map((pkg) => (
          <View key={pkg.identifier}>
          <View style={styles.premiumCard}>
            <Image source={backgroundImage} style={styles.premiumBackground} />
            <View style={styles.premiumOverlay} />
            
            <View style={styles.premiumContent}>
              {/* Premium badge */}
              <View style={styles.premiumBadge}>
                <CrownIcon />
                <T className="text-sm font-cinzel-bold text-black">PREMIUM</T>
              </View>

              {/* Main content */}
              <View style={styles.premiumMainContent}>
                <T className="text-white text-2xl font-cinzel-bold mb-6 text-center">
                  Conviértete en la mejor versión de ti mismo
                </T>

                  <View key={pkg.identifier} style={styles.pricingSection}>
                    <View style={styles.priceComparison}>
                    </View>
                    <T className="text-white text-4xl font-cinzel-bold mb-1">
                      {pkg.product.priceString || '$4.99'}
                    </T>
                    <T className="text-white/80 text-sm mb-6">
                      {pkg.product.subscriptionPeriod === 'P1Y'
                        ? 'por mes • Facturado anualmente'
                        : pkg.product.subscriptionPeriod === 'P1M'
                        ? 'por mes'
                        : 'Suscripción'}
                    </T>
                  </View>

                <View style={styles.featuresList}>
                  <FeatureItem text="Sistema de seguimiento NoFap" />
                  <FeatureItem text="Control de hábitos y metas" />
                  <FeatureItem text="Evolución de arenas y personajes" />
                  <FeatureItem text="Recordatorios inteligentes personalizados" />
                </View>
              </View>

              {/* Trial card */}
              <GlassCard style={styles.trialCard}>
                <T className="text-green-400 font-cinzel-bold text-lg text-center">
                  PRUEBA GRATIS 7 DÍAS
                </T>
                <T className="text-white/80 text-sm text-center mt-1">
                  Cancela cuando quieras, sin compromisos
                </T>
              </GlassCard>
            </View>
          </View>
          {/* CTA Button */}
          
          <AnimatedButton
            onPress={() => handleSuscribe(pkg)}
            disabled={isLoading}
          >
            <View className="flex-row items-center justify-center gap-3">
            <T className="text-black font-cinzel-bold">{isLoading ? 'Comenzando...' : 'COMENZAR SUSCRIPCIÓN'}</T>
            </View>
          </AnimatedButton>



          </View>
          ))}

          
          {/* Discount Code Section */}
          <GlassCard style={styles.discountCodeCard}>
              <View
                style={styles.discountCodeButton}
              >
                <View style={styles.discountCodeButtonContent}>
                  <T className="text-white font-medium text-center">
                    ¿Tienes un código de descuento?
                  </T>
                </View>
                
                <TextInput
                    style={styles.discountInput}
                    placeholder="Código aquí..."
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={discountCode}
                    onChangeText={(text) => setDiscountCode(text)}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                    <AnimatedButton
                    style={{
                        paddingVertical: 8,
                        borderRadius: 12,
                        overflow: 'hidden',
                      }}
                      onPress={() => handleUploadReferalCode(discountCode)}
                      className="mt-5"
                      disabled={isLoading}
                    >
                      <View style={{
                      width: '100%',
                      paddingHorizontal: 30,
                      paddingVertical: 10,
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
                      <View className="flex-row items-center justify-center gap-3">
                      <T className="text-black font-cinzel-bold">{isLoading ? 'Aplicando...' : 'Aplicar'}</T>
                      </View>
                    </View>
                  </AnimatedButton>
              </View>
            
          </GlassCard>
          {/* Trust indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <ShieldIcon />
              <T className="text-white text-xs">Pago seguro</T>
            </View>
            <T className="text-white text-xs">•</T>
            <T className="text-white text-xs">Sin compromisos</T>
            <T className="text-white text-xs">•</T>
            <T className="text-white text-xs">Cancela fácil</T>
          </View>

          {/* Footer text */}
          <T className="text-center text-white text-xs mb-12">
            No pagarás nada hasta que termine tu prueba gratuita de 7 días
          </T>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  header: {
    marginBottom: 32,
  },
  glassCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    marginBottom: 24,
  },
  discountCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  discountContent: {
    alignItems: 'center',
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timerCard: {
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timerDisplay: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  premiumCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 500, // Ensure minimum height
    position: 'relative',
  },
  premiumBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  premiumContent: {
    flex: 1,
    padding: 32,
    position: 'relative',
    justifyContent: 'space-between',
  },
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(245, 158, 11, 1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  premiumMainContent: {
    marginTop: 40, // Account for badge
    flex: 1,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuresList: {
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
    marginTop: 4,
    flexShrink: 0,
  },
  trialCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
    marginTop: 'auto',
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#DAA520',
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  trustIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 16,
    color: '#fbbf24',
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  discountCodeCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    marginBottom: 24,
    marginTop: 24,
  },
  discountCodeButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  discountCodeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountCodeIcon: {
    fontSize: 24,
    color: '#fbbf24',
  },
  discountInputContainer: {
    paddingTop: 16,
  },
  discountInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginRight: 12,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'center',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});