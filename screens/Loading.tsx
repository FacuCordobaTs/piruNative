import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, Image, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { T } from '../components/T';

// Import images
const backgroundImage = require('../assets/images/medieval-house-bg.jpg');
const mascotImage = require('../assets/images/piru-mascot.jpg');

const STEPS = [
  { title: "Configurando tu Perfil", desc: "Conectando con la forja de héroes" },
  { title: "Forjando tus hábitos diarios", desc: "Preparando cofres y recompensas" },
  { title: "Cargando arenas", desc: "Puliendo HUD y misiones diarias" },
];

// Custom icons using emoji
const ShieldIcon = () => <Text style={styles.icon}>🛡️</Text>;
const LoaderIcon = ({ spinning, done }: { spinning: boolean, done: boolean }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spinning) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [spinning]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (done) {
    return <Text style={[styles.icon, styles.doneIcon]}>✅</Text>;
  }

  return (
    <Animated.Text style={[styles.icon, { transform: [{ rotate }] }]}>
      ⚙️
    </Animated.Text>
  );
};
const SparklesIcon = () => <Text style={styles.icon}>✨</Text>;

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
      <Image
        source={backgroundImage}
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
};

// Animated floating mascot
const FloatingMascot = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => float());
    };
    float();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Image source={mascotImage} style={styles.mascot} />
    </Animated.View>
  );
};

// Loading dots animation
const LoadingDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Text style={styles.loadingDots}>{dots}</Text>;
};

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Tabs: undefined;
  Quiz: undefined;
  Loading: undefined;
  Profile: undefined;
};


export default function Loading({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const stepMs = 2000; // 2 seconds per step
  const totalMs = 6000;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Set up step transitions
    for (let i = 1; i <= STEPS.length; i++) {
      timers.push(setTimeout(() => setIndex(i), stepMs * i));
    }
    
    // Navigate after completion
    timers.push(setTimeout(() => {
      navigation.navigate('Profile');
    }, totalMs + 1000));

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: totalMs,
      useNativeDriver: false,
    }).start();

    return () => timers.forEach(clearTimeout);
  }, [navigation]);

  const progressPct = Math.min(100, Math.round((index / (STEPS.length + 1)) * 100));

  return (
    <View style={styles.container}>
      <Image source={backgroundImage} style={styles.backgroundImage} />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
                     <BlurredCard style={styles.mainCard}>
            {/* Header */}
            <View style={styles.header}>
              <ShieldIcon />
              <T className="text-xs uppercase tracking-widest text-white/90">Cargando</T>
            </View>

            {/* Mascot */}
            <View style={styles.mascotContainer}>
              <FloatingMascot />
            </View>

            {/* Steps */}
            <View style={styles.stepsContainer}>
              {STEPS.map((step, i) => {
                const active = i <= index;
                return (
                  <View
                    key={step.title}
                    style={[
                      styles.stepCard,
                      active ? styles.stepCardActive : styles.stepCardInactive
                    ]}
                  >
                                         <LoaderIcon spinning={i === index} done={i < index} />
                    <View style={styles.stepContent}>
                      <View style={styles.stepTitleRow}>
                        <T className="text-s font-cinzel-bold text-white">
                          {step.title}
                        </T>
                        {i === index && <LoadingDots />}
                      </View>
                      <T className="text-xs font-cinzel-bold text-white/80">{step.desc}</T>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['8%', '100%'],
                      }),
                    },
                  ]}
                >
                  <View style={styles.progressGradient} />
                </Animated.View>
              </View>
              <T className="text-right text-xs text-white/75">{progressPct}%</T>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.tipContainer}>
                <SparklesIcon />
                <T className="text-xs text-white font-cinzel-bold">Consejo: las rachas se ganan un día a la vez</T>
              </View>
                         </View>
           </BlurredCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
  },
  doneIcon: {
    color: '#4ade80', // Green color for done state
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mascot: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  stepsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepCardActive: {
    backgroundColor: 'rgba(80,80,80, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  stepCardInactive: {
    backgroundColor: 'rgba(0,0,0, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingDots: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  progressGradient: {
    height: '100%',
    width: '100%',
  },
  footer: {
    alignItems: 'flex-start',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
}); 