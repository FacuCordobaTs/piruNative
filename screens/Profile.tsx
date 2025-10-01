import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Animated, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T } from '../components/T';
import { useHabits } from '../context/HabitsProvider';
import { useUser } from '../context/userProvider';
import { AVAILABLE_HABITS } from '../constants/habits';
import { AnimatedButton } from '../components/AnimatedButton';

const backgroundImage = require('../assets/images/forge.jpg');

// Quiz data interface
interface QuizData {
  name: string;
  age: number | null;
  goals: string[];
  
  // NoFap
  nofap_frequency?: string;
  nofap_frequency_increased?: string;
  nofap_explicit_content?: string;
  nofap_relapse_causes?: string[];

  // Entrenamiento
  training_current_sport?: string;
  training_frequency?: string;
  training_consistency_cause?: string;

  // Sueño
  sleep_hours?: string;
  sleep_tired_on_wake?: string;
  sleep_bedtime?: string;
  sleep_device_usage?: string;

  // Energía
  energy_tired_time?: string;
  energy_level?: string;

  // Enfoque
  focus_distraction_level?: string;
  focus_situations?: string[];

  // Generales
  wakeUpTime: string;
  focusArea: string;
}


const GlassCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
  <View style={[styles.glassCard, style]}>
    {children}
  </View>
);

const Star = ({ left, top, delay }: { left: number; top: number; delay: number }) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return <Animated.View style={[styles.star, { left, top, opacity }]} />;
};

const BlurredCard = ({ children, style, className }: { children: React.ReactNode, style?: any, className?: string }) => {
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
      className={`relative rounded-2xl overflow-hidden mb-4 ${className || ''}`}
      style={style}
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
        blurRadius={30}
      />
      <View className="bg-black/40 p-4">
        {children}
      </View>
    </View>
  );
};

export default function ProfileScreen({navigation}: any) {
  const { width, height } = useWindowDimensions();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userName, setUserName] = useState('Héroe');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Generate personalized habits based on quiz responses
  const generatePersonalizedHabits = (data: QuizData) => {
    const habits = [];

    // NoFap habits
    if (data.goals.includes('nofap')) {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'no_fap'));
    }

    // Training habits
    if (data.goals.includes('training')) {
      if (data.training_current_sport === 'gym') {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'gym_workout'));
      } else if (data.training_current_sport === 'soccer' || data.training_current_sport === 'basketball') {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'run'));
      } else {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'gym_workout'));
      }
    }

    // Sleep habits
    if (data.goals.includes('sleep')) {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'wake_up_early'));
    }

    // Energy habits
    if (data.goals.includes('energy')) {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'drink_water'));
      if (data.energy_tired_time === 'after_lunch') {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'wake_up_early'));
      }
    }

    // Focus habits
    if (data.goals.includes('focus')) {
      if (data.focus_distraction_level === 'easy') {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'screentime_limit'));
      }
      
      if (data.focus_situations?.includes('studies')) {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'studying'));
      }
      
      if (data.focus_situations?.includes('meditation')) {
        habits.push(AVAILABLE_HABITS.find(h => h.id === 'meditate'));
      }
    }

    // Add general habits based on focus area
    if (data.focusArea === 'physical') {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'gym_workout'));
    } else if (data.focusArea === 'intellect') {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'read_books'));
    } else if (data.focusArea === 'psyche') {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'meditate'));
    } else if (data.focusArea === 'spiritual') {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'praying'));
    } else if (data.focusArea === 'core') {
      habits.push(AVAILABLE_HABITS.find(h => h.id === 'gym_workout'));
    }

    // Ensure we have at least 3 habits
    if (habits.length < 3) {
      const defaultHabits = [
        AVAILABLE_HABITS.find(h => h.id === 'gym_workout'),
        AVAILABLE_HABITS.find(h => h.id === 'meditate'),
        AVAILABLE_HABITS.find(h => h.id === 'praying'),
      ];
      
      habits.push(...defaultHabits.slice(0, 3 - habits.length));
    }

    return habits.filter(Boolean).slice(0, 5); // Return max 5 habits, filter out undefined
  };

    const [personalizedHabits, setPersonalizedHabits] = useState<any[]>([]);
  const { createHabit } = useHabits();
  const { isAuthenticated, token, isSuscribed } = useUser();

  // Load quiz data and generate personalized habits
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const storedQuizData = await AsyncStorage.getItem('quizData');
        if (storedQuizData) {
          const data = JSON.parse(storedQuizData) as QuizData;
          setQuizData(data);
          setUserName(data.name || 'Héroe');
          const habits = generatePersonalizedHabits(data);
          setPersonalizedHabits(habits);
        } else {
          // Fallback to default habits if no quiz data
          const defaultHabits = [
            AVAILABLE_HABITS.find(h => h.id === 'gym_workout'),
            AVAILABLE_HABITS.find(h => h.id === 'meditate'),
            AVAILABLE_HABITS.find(h => h.id === 'praying'),
          ].filter(Boolean);
          setPersonalizedHabits(defaultHabits);
        }
      } catch (error) {
        console.error('Error loading quiz data:', error);
        // Fallback to default habits
        const defaultHabits = [
          AVAILABLE_HABITS.find(h => h.id === 'gym_workout'),
          AVAILABLE_HABITS.find(h => h.id === 'meditate'),
          AVAILABLE_HABITS.find(h => h.id === 'praying'),
        ].filter(Boolean);
        setPersonalizedHabits(defaultHabits);
      }
    };

    loadQuizData();
  }, []);

  const arenaLevels = [
    { level: 1, name: 'Aldea Pacífica', image: require('../assets/images/nivel1.jpg'), current: user?.level === 1 },
    { level: 2, name: 'Bosque Encantado', image: require('../assets/images/nivel2.jpg'), current: user?.level === 2 },
    { level: 3, name: 'Puente Ancestral', image: require('../assets/images/nivel3.jpg'), current: user?.level === 3 },
    { level: 4, name: 'Valle Místico', image: require('../assets/images/nivel4.jpg'), current: user?.level === 4 },
    { level: 5, name: 'Castillo Otoñal', image: require('../assets/images/nivel5.jpg'), current: user?.level === 5 },
    { level: 6, name: 'Torre del Dragón', image: require('../assets/images/nivel6.jpg'), current: user?.level === 6 },
    { level: 7, name: 'Ciudadela Celestial', image: require('../assets/images/nivel7.jpg'), current: user?.level === 7 },
  ];

  const stars = useMemo(
    () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * Math.max(1, width - 4),
      top: Math.random() * Math.max(1, height - 4),
      delay: Math.random() * 3000,
    })),
    [width, height]
  );


  const handleContinue = async () => {
    try {
      setIsLoading(true);
      
      // Save personalized habits to AsyncStorage for the SelectHabits screen
      await AsyncStorage.setItem('personalizedHabits', JSON.stringify(personalizedHabits));
      
      navigation.replace('SelectHabits');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      navigation.replace('SelectHabits');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backgroundImage} style={styles.backgroundImage} />
      <View style={styles.overlay} />

      <View style={styles.starsContainer} pointerEvents="none">
        {stars.map((s) => (
          <Star key={s.id} left={s.left} top={s.top} delay={s.delay} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BlurredCard>
            <View style={styles.headerInner}>
              <T className="text-2xl font-cinzel-bold text-white mb-2">¡Bienvenido, {userName}!</T>
              <T className="text-white/80">
                Comenzás tu aventura con tu Piru en <Text className='font-cinzel-bold' style={{ color: '#fbbf24' }}>Nivel 1</Text>
              </T>
              <Image source={require('../assets/images/piru-transparent.png')} style={{ width: 150, height: 150, objectFit: 'contain', marginHorizontal: 'auto', marginTop: 20 }}/>
            </View>
          </BlurredCard>

          <GlassCard style={styles.habitsCard}>
            <View style={styles.habitsHeader}>
              <T className="text-lg font-cinzel-bold text-white text-center mb-2">
                Plan Especial Personalizado
              </T>
              <T className="text-sm text-white/80 text-center mb-4">
                Hemos creado un plan especial basado en tu perfil. Puedes modificarlo en la siguiente pantalla.
              </T>
            </View>
            <View className="items-center">
              <View style={styles.planCard}>
                <T className="text-white font-cinzel-bold text-lg mb-2">Tu Plan Incluye:</T>
                <T className="text-white/80 text-center mb-4">
                  {personalizedHabits.length} hábitos personalizados
                </T>
                <View className="flex-row flex-wrap justify-center gap-2">
                  {personalizedHabits.map((habit: any, index: number) => (
                    <View key={habit.id || habit.name} style={styles.habitChip}>
                      <T className="text-white text-xs font-cinzel">{habit.name}</T>
                    </View>
                  ))}
                </View>
                <T className="text-yellow-400 text-center mt-4 text-sm">
                  ✨ Podrás personalizar horarios y días
                </T>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.arenasCard}>
            <T className="text-lg font-cinzel-bold text-white text-center mb-2">Estos son los niveles que puedes ir escalando</T>
            <T className="text-sm text-white/80 text-center mb-4">
              Comenzás en <Text style={{ color: '#fbbf24', fontWeight: '700' }}>Arena 1</Text> y vas desbloqueando nuevas arenas a medida que subes de nivel completando hábitos
            </T>
            <View style={styles.arenasScroll}>
              {arenaLevels.slice().reverse().map((arena) => (
                <View
                  key={arena.level}
                  style={[
                    styles.arenaCard,
                    arena.current ? styles.arenaCardCurrent : styles.arenaCardDefault,
                  ]}
                >
                  <Image source={arena.image} style={styles.arenaImage} />
                  <View style={styles.arenaOverlay} />
                  <View style={styles.arenaTextWrap}>
                    <Text style={[styles.arenaLevel, { color: arena.current ? '#fbbf24' : '#fff' }]} className='font-cinzel-bold'>Arena {arena.level}</Text>
                    <Text style={styles.arenaName} className='font-cinzel'>{arena.name}</Text>
                  </View>
                  {arena.current && (
                    <View style={styles.arenaBadgeWrap}>
                      <View style={styles.arenaBadge}><Text style={styles.arenaBadgeText} className='font-cinzel-bold'>ACTUAL</Text></View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </GlassCard>
          <AnimatedButton
            onPress={handleContinue}
            disabled={isLoading}
          >
              <View className="flex-row items-center justify-center gap-3">
                <T className="font-cinzel-bold text-black text-center">{isLoading ? 'Cargando...' : '¡Personalizar mi Plan!'}</T>
              </View>
            </AnimatedButton>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  blurredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  }, 
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingVertical: 64,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  glassCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    marginBottom: 16,
  },
  headerInner: { 
    padding: 24,
  },
  flameCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  flameText: {
    fontSize: 24,
  },
  habitsCard: {
    padding: 20,
  },
  habitsHeader: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    color: '#fbbf24',
    marginRight: 6,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIcon: {
    fontSize: 18,
  },
  habitInfo: {
    flex: 1,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clockIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  arenasCard: {
    padding: 20,
  },
  arenasScroll: {
    paddingHorizontal: 8,
  },
  arenaCard: {
    width: 300,
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 'auto',
    borderWidth: 2,
    marginBottom: 24,
  },
  arenaCardCurrent: {
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  arenaCardDefault: {
    borderColor: 'rgba(255,255,255,0.3)',
    opacity: 0.9,
  },
  arenaImage: {
    width: 300,
    height: 500,
    objectFit: 'cover',
  },
  arenaOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  arenaTextWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    alignItems: 'center',
  },
  arenaLevel: {
    fontSize: 12,
    marginBottom: 4,
  },
  arenaName: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 12,
  },
  arenaBadgeWrap: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -32,
  },
  arenaBadge: {
    backgroundColor: '#fbbf24',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  arenaBadgeText: {
    fontSize: 10,
    color: '#000',
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  ironButtonGradient: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ironButtonBorder: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 3,
    borderTopColor: '#4a4a4a',
    borderLeftColor: '#4a4a4a',
    borderRightColor: '#1a1a1a',
    borderBottomColor: '#1a1a1a', 
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  
  },
  ironButton: {
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    alignItems: 'center',
  },
  habitChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
