import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Animated, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T } from '../components/T';
import { Brain, Dumbbell, Flame, Heart, Target, Users, Trash2 } from 'lucide-react-native';
import { useHabits } from '../context/HabitsProvider';
import { useUser } from '../context/userProvider';

const backgroundImage = require('../assets/images/medieval-house-bg.jpg');

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
      if (data.nofap_frequency === 'daily' || data.nofap_frequency === 'weekly') {
        habits.push({ 
          icon: '🛡️', 
          name: 'NoFap', 
          category: 'NoFap', 
          streak: 0,
          description: 'Mantener la abstinencia y fortalecer la voluntad'
        });
      }
      
      if (data.nofap_relapse_causes?.includes('stress')) {
        habits.push({ 
          icon: '🧘', 
          name: 'Meditación anti-estrés', 
          category: 'Mental', 
          streak: 0,
          description: 'Meditar 10 minutos para manejar el estrés'
        });
      }
      
      if (data.nofap_relapse_causes?.includes('boredom')) {
        habits.push({ 
          icon: '📚', 
          name: 'Lectura productiva', 
          category: 'Intelecto', 
          streak: 0,
          description: 'Leer 30 minutos para evitar el aburrimiento'
        });
      }
    }

    // Training habits
    if (data.goals.includes('training')) {
      if (data.training_current_sport === 'gym') {
        habits.push({ 
          icon: '💪', 
          name: 'Entrenamiento en gimnasio', 
          category: 'Físico', 
          streak: 0,
          description: 'Ir al gimnasio 3-4 veces por semana'
        });
      } else if (data.training_current_sport === 'soccer') {
        habits.push({ 
          icon: '⚽', 
          name: 'Práctica de fútbol', 
          category: 'Físico', 
          streak: 0,
          description: 'Entrenar fútbol regularmente'
        });
      } else if (data.training_current_sport === 'basketball') {
        habits.push({ 
          icon: '🏀', 
          name: 'Práctica de baloncesto', 
          category: 'Físico', 
          streak: 0,
          description: 'Entrenar baloncesto regularmente'
        });
      } else {
        habits.push({ 
          icon: '🏃', 
          name: 'Ejercicio diario', 
          category: 'Físico', 
          streak: 0,
          description: 'Hacer ejercicio 30 minutos al día'
        });
      }

      if (data.training_consistency_cause === 'motivation') {
        habits.push({ 
          icon: '🔥', 
          name: 'Visualización de objetivos', 
          category: 'Mental', 
          streak: 0,
          description: 'Visualizar tus metas deportivas cada mañana'
        });
      }
    }

    // Sleep habits
    if (data.goals.includes('sleep')) {
      if (data.sleep_hours === '<7') {
        habits.push({ 
          icon: '🌙', 
          name: 'Dormir 8 horas', 
          category: 'Físico', 
          streak: 0,
          description: 'Asegurar 8 horas de sueño de calidad'
        });
      }
      
      if (data.sleep_tired_on_wake === 'always' || data.sleep_tired_on_wake === 'normally') {
        habits.push({ 
          icon: '⏰', 
          name: 'Rutina de sueño', 
          category: 'Físico', 
          streak: 0,
          description: 'Acostarse y levantarse a la misma hora'
        });
      }
    }

    // Energy habits
    if (data.goals.includes('energy')) {
      if (data.energy_level === '1' || data.energy_level === '2') {
        habits.push({ 
          icon: '💧', 
          name: 'Hidratación', 
          category: 'Físico', 
          streak: 0,
          description: 'Beber 2L de agua al día'
        });
        habits.push({ 
          icon: '🥗', 
          name: 'Alimentación saludable', 
          category: 'Físico', 
          streak: 0,
          description: 'Comer 3 comidas balanceadas al día'
        });
      }
      
      if (data.energy_tired_time === 'after_lunch') {
        habits.push({ 
          icon: '☀️', 
          name: 'Exposición solar', 
          category: 'Físico', 
          streak: 0,
          description: 'Tomar 15 minutos de sol por la mañana'
        });
      }
    }

    // Focus habits
    if (data.goals.includes('focus')) {
      if (data.focus_distraction_level === 'easy') {
        habits.push({ 
          icon: '📱', 
          name: 'Desconexión digital', 
          category: 'Mental', 
          streak: 0,
          description: 'Evitar redes sociales durante 2 horas al día'
        });
      }
      
      if (data.focus_situations?.includes('studies')) {
        habits.push({ 
          icon: '📖', 
          name: 'Estudio enfocado', 
          category: 'Intelecto', 
          streak: 0,
          description: 'Estudiar 45 minutos sin interrupciones'
        });
      }
      
      if (data.focus_situations?.includes('meditation')) {
        habits.push({ 
          icon: '🧘', 
          name: 'Meditación diaria', 
          category: 'Espiritual', 
          streak: 0,
          description: 'Meditar 10 minutos cada mañana'
        });
      }
    }

    // Add general habits based on focus area
    if (data.focusArea === 'physical') {
      habits.push({ 
        icon: '🏋️', 
        name: 'Ejercicio físico', 
        category: 'Físico', 
        streak: 0,
        description: 'Actividad física diaria'
      });
    } else if (data.focusArea === 'intellect') {
      habits.push({ 
        icon: '📚', 
        name: 'Lectura diaria', 
        category: 'Intelecto', 
        streak: 0,
        description: 'Leer 30 minutos al día'
      });
    } else if (data.focusArea === 'psyche') {
      habits.push({ 
        icon: '🧘', 
        name: 'Mindfulness', 
        category: 'Mental', 
        streak: 0,
        description: 'Práctica de mindfulness diaria'
      });
    } else if (data.focusArea === 'spiritual') {
      habits.push({ 
        icon: '🙏', 
        name: 'Gratitud', 
        category: 'Espiritual', 
        streak: 0,
        description: 'Escribir 3 cosas por las que estás agradecido'
      });
    } else if (data.focusArea === 'core') {
      habits.push({ 
        icon: '💪', 
        name: 'Autodisciplina', 
        category: 'Core', 
        streak: 0,
        description: 'Completar una tarea difícil cada día'
      });
    }

    // Ensure we have at least 3 habits
    if (habits.length < 3) {
      const defaultHabits = [
        { icon: '🏋️', name: 'Ejercicio diario', category: 'Físico', streak: 0, description: 'Actividad física diaria' },
        { icon: '🧠', name: 'Meditación', category: 'Mental', streak: 0, description: 'Meditar 10 minutos al día' },
        { icon: '❤️', name: 'Gratitud', category: 'Espiritual', streak: 0, description: 'Practicar gratitud diaria' },
      ];
      
      habits.push(...defaultHabits.slice(0, 3 - habits.length));
    }

    return habits.slice(0, 5); // Return max 5 habits
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
            { icon: '🏋️', name: 'Ejercicio diario', category: 'Físico', streak: 0, description: 'Actividad física diaria' },
            { icon: '🧠', name: 'Meditación', category: 'Mental', streak: 0, description: 'Meditar 10 minutos al día' },
            { icon: '❤️', name: 'Gratitud', category: 'Espiritual', streak: 0, description: 'Practicar gratitud diaria' },
          ];
          setPersonalizedHabits(defaultHabits);
        }
      } catch (error) {
        console.error('Error loading quiz data:', error);
        // Fallback to default habits
        const defaultHabits = [
          { icon: '🏋️', name: 'Ejercicio diario', category: 'Físico', streak: 0, description: 'Actividad física diaria' },
          { icon: '🧠', name: 'Meditación', category: 'Mental', streak: 0, description: 'Meditar 10 minutos al día' },
          { icon: '❤️', name: 'Gratitud', category: 'Espiritual', streak: 0, description: 'Practicar gratitud diaria' },
        ];
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

  const handleDeleteHabit = (habitName: string) => {
    setPersonalizedHabits(prevHabits => prevHabits.filter(habit => habit.name !== habitName));
  };

  const handleContinue = async () => {
    try {
      // Check if user is authenticated
      setIsLoading(true);
      if (!isAuthenticated || !token) {
        console.log('User not authenticated, saving to AsyncStorage only');
        await AsyncStorage.setItem('personalizedHabits', JSON.stringify(personalizedHabits));
        // Navigate to Pricing for unauthenticated users
        navigation.navigate('Pricing');
        return;
      }

      console.log('User is authenticated, creating habits via API');
      
      // Filter out NoFap habits - they are handled separately in the NoFap system
      const habitsToCreate = personalizedHabits.filter(habit => habit.category !== 'NoFap');
      console.log(`Filtered out ${personalizedHabits.length - habitsToCreate.length} NoFap habits, creating ${habitsToCreate.length} regular habits`);
      
      // Create habits using the HabitsProvider
      for (const habit of habitsToCreate) {
        console.log('Creating habit:', habit.name);
        
        const habitData = {
          name: habit.name,
          description: habit.description,
          targetDays: [true, true, true, true, true, true, true], // All days by default
          experienceReward: 10, // Default experience reward
          reminderTime: '09:00', // Default reminder time
          categories: [
            habit.category === 'Físico',    // physical
            habit.category === 'Mental',    // mental
            habit.category === 'Espiritual', // spiritual
            habit.category === 'Core',      // discipline
            habit.category === 'Intelecto'  // social
          ]
        };
        
        console.log('Habit data being sent:', JSON.stringify(habitData, null, 2));
        
        try {
          await createHabit(habitData);
          console.log('Successfully created habit:', habit.name);
        } catch (habitError) {
          console.error(`Error creating habit "${habit.name}":`, {
            message: habitError instanceof Error ? habitError.message : 'Unknown error',
            stack: habitError instanceof Error ? habitError.stack : undefined,
            error: JSON.stringify(habitError, Object.getOwnPropertyNames(habitError)),
            status: (habitError as any).status,
            statusText: (habitError as any).statusText,
            name: habitError instanceof Error ? habitError.name : 'Unknown',
            cause: (habitError as any).cause
          });
          // Continue with other habits even if one fails
        }
      }
      
      // Save personalized habits to AsyncStorage for backup
      await AsyncStorage.setItem('personalizedHabits', JSON.stringify(personalizedHabits));
      
      // Check subscription status and navigate accordingly
      if (isSuscribed) {
        navigation.navigate('Tabs');
      } else {
        navigation.navigate('Pricing');
      }
    } catch (error) {
      console.error('Error in handleContinue:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      // Still save to AsyncStorage as backup even if API fails
      try {
        await AsyncStorage.setItem('personalizedHabits', JSON.stringify(personalizedHabits));
      } catch (storageError) {
        console.error('Error saving habits to storage:', storageError);
      }
      // Check subscription status and navigate accordingly even if there were errors
      if (isSuscribed) {
        navigation.navigate('Tabs');
      } else {
        navigation.navigate('Pricing');
      }
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
              <T className="text-lg font-cinzel-bold text-white">
                {quizData ? 'Hemos personalizado estos hábitos para ti:' : 'Hemos definido estos hábitos para ti:'}
              </T>
              <T className="text-sm text-white/80">
                Luego podrás cambiarlos
              </T>
            </View>
            <View>
              {personalizedHabits.map((habit: any) => (
                <View
                key={habit.name}
                style={styles.ironButton}
                >
                  <View
                    style={styles.ironButtonGradient}
                  >
                    <View className="flex-row items-center justify-between p-4"  style={styles.ironButtonBorder}>
                      <View key={habit.name} className="flex-row items-center gap-4 flex-1">
                        <View className={`w-8 h-8 rounded-full items-center justify-center`}>
                        {habit.category === 'Físico' && <Dumbbell color={'white'} size={24} />}
                        {habit.category === 'Mental' && <Brain color={'white'} size={24} />}
                        {habit.category === 'Espiritual' && <Heart color={'white'} size={24} />}
                        {habit.category === 'Intelecto' && <Target color={'white'} size={24} />}
                        {habit.category === 'Core' && <Users color={'white'} size={24} />} 
                        {habit.category === 'NoFap' && <Flame color={'white'} size={24} />}
                  </View>
                        <View className="flex-1">
                          <T className="font-cinzel-bold text-sm text-white">{habit.name}</T>
                    <T className="text-xs text-white/70">{habit.category}</T>
                          {habit.description && (
                            <T className="text-xs text-white/50 mt-1">{habit.description}</T>
                          )}
                  </View>
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => handleDeleteHabit(habit.name)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              borderRadius: 8,
                              padding: 6,
                              borderWidth: 1,
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            <Trash2 color={'#ef4444'} size={16} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.arenasCard}>
            <T className="text-lg font-bold text-white text-center mb-2">Estos son los niveles que puedes ir escalando en la app</T>
            <T className="text-sm text-white/80 text-center mb-4">
              Comenzás en <Text style={{ color: '#fbbf24', fontWeight: '700' }}>Arena 1</Text> y vas desbloqueando nuevas arenas
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
          <TouchableOpacity
          disabled={isLoading}
          onPress={handleContinue}
          className="mt-6 w-full"
          activeOpacity={0.9}
          style={{
            paddingVertical: 8,
            borderRadius: 12,
            overflow: 'hidden',
          }}
          >
            <View style={{
              width: '100%',
              paddingHorizontal: 6,
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
              marginBottom: 16,
            }}>
              <View className="flex-row items-center justify-center gap-3">
                <T className="font-cinzel-bold text-black text-center">{isLoading ? 'Comenzando...' : '¡Comenzar mi aventura!'}</T>
              </View>
            </View>
          </TouchableOpacity>
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
});
