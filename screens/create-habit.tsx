import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { T } from '../components/T';
import { useHabits } from '../context/HabitsProvider';
import { Dumbbell, Brain, Heart, Target, Users, Clock, Zap, Shield, Flame, Wine, Cross, BookOpen, PenTool, BookMarked, Smartphone, Droplets, Sun } from 'lucide-react-native';
import { useNotifications } from '../hooks/useNotifications';
import { AVAILABLE_HABITS, PredefinedHabit, mapPredefinedToCreateData } from '../constants/habits';
import { AnimatedButton } from '../components/AnimatedButton';

const backgroundImage = require('../assets/images/landscape-quiz.jpg');

// Componente para el efecto de glassmorphism con estilos del quiz
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
      className={`relative rounded-3xl overflow-hidden ${className || ''}`}
      style={style}
    >
      {/* <Image
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
        blurRadius={20}
      /> */}
      <View className="rounded-3xl bg-black/30">
        {children}
      </View>
    </View>
  );
};


// Componente para los días de la semana, adaptado del OptionButton del quiz
const DayButton = ({ onPress, active, label }: { onPress: () => void, active: boolean, label: string }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="flex-1 aspect-square">
    <View className={`flex-1 rounded-xl justify-center items-center border ${
      active 
        ? 'bg-yellow-400/30 border-yellow-400' 
        : 'bg-white/10 border-white/20'
    }`}>
      <T className="text-white font-cinzel-bold text-lg">{label}</T>
    </View>
  </TouchableOpacity>
);

// Habit Selection Component
const HabitCard = ({ 
  habit, 
  isSelected, 
  onToggle, 
  isCustomizable, 
  customization, 
  onUpdateCustomization 
}: { 
  habit: PredefinedHabit, 
  isSelected: boolean, 
  onToggle: () => void,
  isCustomizable: boolean,
  customization: {days: boolean[], time: string},
  onUpdateCustomization: (field: 'days' | 'time', value: boolean[] | string) => void
}) => {
  const getIconComponent = (iconName: string) => {
    const iconProps = { color: 'white', size: 20 };
    switch (iconName) {
      case 'Sun': return <Sun {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Dumbbell': return <Dumbbell {...iconProps} />;
      case 'Droplets': return <Droplets {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Smartphone': return <Smartphone {...iconProps} />;
      case 'BookOpen': return <BookOpen {...iconProps} />;
      case 'PenTool': return <PenTool {...iconProps} />;
      case 'BookMarked': return <BookMarked {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Flame': return <Flame {...iconProps} />;
      case 'Wine': return <Wine {...iconProps} />;
      case 'Cross': return <Cross {...iconProps} />;
      default: return <Target {...iconProps} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { color: 'white', size: 12 };
    switch (category) {
      case 'Físico': return <Dumbbell {...iconProps} />;
      case 'Mental': return <Brain {...iconProps} />;
      case 'Espiritual': return <Heart {...iconProps} />;
      case 'Intelecto': return <Target {...iconProps} />;
      case 'NoFap': return <Shield {...iconProps} />;
      default: return <Target {...iconProps} />;
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const starCount = difficulty === 'Fácil' ? 1 : difficulty === 'Medio' ? 2 : 3;
    return Array.from({ length: 3 }, (_, index) => (
      <T key={index} className="text-yellow-400 text-xs">
        {index < starCount ? '★' : '☆'}
      </T>
    ));
  };

  const toggleDay = (dayIndex: number) => {
    const newDays = [...customization.days];
    newDays[dayIndex] = !newDays[dayIndex];
    onUpdateCustomization('days', newDays);
  };

  return (
    <View style={styles.habitCardWrapper}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={[styles.habitCard, isSelected ? styles.habitCardSelected : styles.habitCardUnselected]}
      >
        <Image 
          source={habit.image} 
          style={styles.habitImage}
          resizeMode="cover"
        />
        <View style={styles.habitContent}>
          <View style={styles.habitHeader}>
            <T className="font-cinzel-bold text-white text-base">{habit.name}</T>
            <View style={styles.habitMeta}>
              <View style={styles.categoriesContainer}>
                {habit.categories.map((category: string, index: number) => (
                  <View key={index} style={styles.categoryItem}>
                    {getCategoryIcon(category)}
                    <T className="text-white text-xs font-cinzel ml-1 mb-1">{category}</T>
                  </View>
                ))}
              </View>
              <View style={styles.difficultyContainer}>
                <T className="text-white text-xs font-cinzel mr-1">Dificultad:</T>
                <View style={styles.starsContainer}>
                  {getDifficultyStars(habit.difficulty)}
                </View>
              </View>
            </View>
          </View>
          <T className="text-xs text-white/60 mt-1">{habit.description}</T>
          <View style={styles.habitDetails}>
            <View style={styles.habitDetailItem}>
              <Clock color="rgba(255, 255, 255, 0.6)" size={12} />
              <T className="text-xs text-white/60 ml-1">{customization.time}</T>
            </View>
            <View style={styles.habitDetailItem}>
              <T className="text-xs text-white/60">+{habit.experienceReward} XP</T>
            </View>
          </View>
        </View>
        <View style={styles.habitSelector}>
          <View style={[styles.selectorCircle, isSelected ? styles.selectorCircleSelected : styles.selectorCircleUnselected]}>
            {isSelected && <T className="text-white text-xs font-bold">✓</T>}
          </View>
        </View>
      </TouchableOpacity>

      {/* Customization Panel - Only show if habit is selected and customizable */}
      {isSelected && isCustomizable && (
        <View style={styles.customizationPanel}>
          <T className="text-white font-cinzel-bold text-sm mb-3">Personalizar horario</T>
          
          {/* Time Selection */}
          <View style={styles.timeSelector}>
            <T className="text-white text-xs mb-2">Hora de notificación:</T>
            <View style={styles.timePicker}>
              <View style={styles.timeDisplay}>
                <T className="text-white font-cinzel-bold text-lg">{customization.time}</T>
              </View>
              <View style={styles.timeButtons}>
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '06:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '06:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '06:00' ? 'text-black' : 'text-white'}`}>6:00</T>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '07:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '07:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '07:00' ? 'text-black' : 'text-white'}`}>7:00</T>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '08:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '08:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '08:00' ? 'text-black' : 'text-white'}`}>8:00</T>
                  </TouchableOpacity>
                </View>
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '09:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '09:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '09:00' ? 'text-black' : 'text-white'}`}>9:00</T>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '10:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '10:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '10:00' ? 'text-black' : 'text-white'}`}>10:00</T>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '11:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '11:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '11:00' ? 'text-black' : 'text-white'}`}>11:00</T>
                  </TouchableOpacity>
                </View>
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '12:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '12:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '12:00' ? 'text-black' : 'text-white'}`}>12:00</T>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '18:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '18:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '18:00' ? 'text-black' : 'text-white'}`}>18:00</T>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeButton, customization.time === '20:00' && styles.timeButtonActive]}
                    onPress={() => onUpdateCustomization('time', '20:00')}
                  >
                    <T className={`text-xs font-cinzel ${customization.time === '20:00' ? 'text-black' : 'text-white'}`}>20:00</T>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Days Selection */}
          <View style={styles.daysSelector}>
            <T className="text-white text-xs mb-2">Días de la semana:</T>
            <View style={styles.daysRow}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleDay(index)}
                  style={[styles.dayButton, customization.days[index] ? styles.dayButtonActive : styles.dayButtonInactive]}
                >
                  <T className={`text-xs font-cinzel ${customization.days[index] ? 'text-black' : 'text-white'}`}>
                    {day}
                  </T>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default function CreateHabitScreen({ navigation }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<boolean[]>([true, true, true, true, true, true, true]);
  const [customizedHabits, setCustomizedHabits] = useState<{[key: string]: {days: boolean[], time: string}}>({});
  const { createHabit, habits, refreshHabits } = useHabits();
  const { hasPermission, requestPermissions } = useNotifications();

  // Refresh habits when component mounts to ensure we have the latest data
  useEffect(() => {
    refreshHabits();
  }, []);

  const days = [
    { short: "L", boolean: false },
    { short: "M", boolean: false },
    { short: "M", boolean: false },
    { short: "J", boolean: false },
    { short: "V", boolean: false },
    { short: "S", boolean: false },
    { short: "D", boolean: false },
  ];

  // Habits that can be customized (not abstinence habits)
  const customizableHabits = ['run', 'gym_workout', 'drink_water', 'cold_shower', 'meditate', 'screentime_limit', 'read_books', 'journaling', 'sit_up', 'push_up', 'studying', 'wake_up_early'];

  const isCustomizable = (habitId: string) => {
    return customizableHabits.includes(habitId);
  };

  const getHabitCustomization = (habitId: string) => {
    return customizedHabits[habitId] || {
      days: [true, true, true, true, true, true, true],
      time: AVAILABLE_HABITS.find(h => h.id === habitId)?.reminderTime || '09:00'
    };
  };

  const updateHabitCustomization = (habitId: string, field: 'days' | 'time', value: boolean[] | string) => {
    setCustomizedHabits(prev => ({
      ...prev,
      [habitId]: {
        ...getHabitCustomization(habitId),
        [field]: value
      }
    }));
  };

  // Filter out habits that user already has
  const getAvailableHabits = () => {
    return AVAILABLE_HABITS.filter(habit => {
      // Check if user already has this habit by name or predefinedId
      return !habits.some(existingHabit => 
        existingHabit.name === habit.name || 
        existingHabit.predefinedId === habit.id
      );
    });
  };

  const toggleHabit = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const toggleDay = (pos: number) => {
    setSelectedDays(prev => prev.map((d, i) => i === pos ? !d : d));
  };

  const handleCreateHabits = async () => {
    if (selectedHabits.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un hábito para crear.');
      return;
    }

    // Verificar permisos de notificación antes de crear los hábitos
    if (!hasPermission) {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        Alert.alert(
          'Permisos requeridos',
          'Para recibir recordatorios de tus hábitos, necesitas permitir las notificaciones.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar', onPress: () => requestPermissions() }
          ]
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      // Create each selected habit
      for (const habitId of selectedHabits) {
        const predefinedHabit = getAvailableHabits().find(h => h.id === habitId);
        if (predefinedHabit) {
          const habitData = mapPredefinedToCreateData(predefinedHabit);
          
          // Use customized settings if available, otherwise use default
          const customization = getHabitCustomization(habitId);
          habitData.targetDays = customization.days;
          habitData.reminderTime = customization.time;
          habitData.predefinedId = predefinedHabit.id;
          habitData.image = predefinedHabit.image;
          
          await createHabit(habitData);
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error creating habits:', error);
      Alert.alert('Error', 'No se pudieron crear los hábitos. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={backgroundImage}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/50" />

        <SafeAreaView className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

            {/* Card para el encabezado */}
            <BlurredCard className="rounded-3xl mb-5 ">
              <View className="flex-column justify-between p-5">
                <T className="text-xl font-cinzel-bold text-white">Seleccionar Hábitos</T>
                <View className="">
                  <T className="text-sm text-white/70">{selectedHabits.length} seleccionados</T>
                  <T className="text-xs text-white/50">{getAvailableHabits().length} disponibles</T>
                </View>
              </View>
            </BlurredCard>


            {/* Card para selección de hábitos */}
            <BlurredCard className="rounded-3xl mb-5">
              <View className="p-6">
                <T className="text-xl font-cinzel-bold text-white mb-4">Selecciona tus hábitos</T>
                {getAvailableHabits().length > 0 ? (
                  <View className="gap-3">
                    {getAvailableHabits().map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isSelected={selectedHabits.includes(habit.id)}
                        onToggle={() => toggleHabit(habit.id)}
                        isCustomizable={isCustomizable(habit.id)}
                        customization={getHabitCustomization(habit.id)}
                        onUpdateCustomization={(field, value) => updateHabitCustomization(habit.id, field, value)}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <T className="text-white/70 text-center mb-2">¡Ya tienes todos los hábitos disponibles!</T>
                    <T className="text-white/50 text-center text-sm">No hay más hábitos para agregar en este momento.</T>
                  </View>
                )}
              </View>
            </BlurredCard>

            {/* Botón de envío */}
            <View className="py-5 px-2.5">
              <AnimatedButton
                onPress={handleCreateHabits}
                disabled={selectedHabits.length === 0 || isSubmitting || getAvailableHabits().length === 0}
                style={styles.submitButton}
              >
                <View className="flex-row items-center justify-center">
                  <T className="ml-2 text-black font-cinzel-bold text-base">
                    {isSubmitting ? 'Creando...' : 
                     getAvailableHabits().length === 0 ? 'No hay hábitos disponibles' :
                     `Crear ${selectedHabits.length} Hábito${selectedHabits.length !== 1 ? 's' : ''}`}
                  </T>
                </View>
              </AnimatedButton>
            </View>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  // BlurredCard complex positioning styles
  blurredImage: {
    position: 'absolute',
    // Los estilos top, left, width y height se ajustan dinámicamente
  },
  
  // Iron button complex border and shadow effects
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
    shadowColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  
  ironButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gold button complex border and shadow effects
  goldButtonBorder: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 3,
    borderTopColor: '#FFD700',
    borderLeftColor: '#FFD700',
    borderRightColor: '#F59E0B',
    borderBottomColor: '#F59E0B',
    backgroundColor: 'rgba(255, 215, 0, 1)',
  },

  // Submit button dimensions
  submitButton: {
    width: '100%', 
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  textInput: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16, 
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    fontSize: 16,
  },
  // Habit card styles
  habitCardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  habitCard: {
    flexDirection: 'column',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  habitImage: {
    width: '100%',
    height: 120,
  },
  habitCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  habitCardUnselected: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  habitContent: {
    flex: 1,
    padding: 16,
  },
  habitHeader: {
    marginBottom: 4,
  },
  habitMeta: {
    flexDirection: 'column',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'column',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  habitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  habitDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitSelector: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  selectorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorCircleSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 1)',
  },
  selectorCircleUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  // Customization panel styles
  customizationPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeSelector: {
    marginBottom: 16,
  },
  timePicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  timeButtons: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeButtonActive: {
    backgroundColor: '#DAA520',
    borderColor: '#DAA520',
  },
  daysSelector: {
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayButtonActive: {
    backgroundColor: '#DAA520',
    borderColor: '#DAA520',
  },
  dayButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});