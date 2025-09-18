import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, SafeAreaView, Image, ScrollView, StyleSheet, useWindowDimensions, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T } from '../components/T';
import { Brain, Dumbbell, Flame, Heart, Target, Users, Clock, BookOpen, Sun, Droplets, Smartphone, PenTool, BookMarked, Zap, Shield, Wine, Cross } from 'lucide-react-native';
import { useHabits } from '../context/HabitsProvider';
import { useUser } from '../context/userProvider';
import { AVAILABLE_HABITS, PredefinedHabit, mapPredefinedToCreateData } from '../constants/habits';

const backgroundImage = require('../assets/images/medieval-house-bg.jpg');

// Componente para el efecto de glassmorphism
const BlurredCard = ({ 
  children, 
  style, 
  className 
}: { 
  children: React.ReactNode, 
  style?: any, 
  className?: string
}) => {
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
        blurRadius={30}
      /> */}
      <View className="bg-black/40 p-4">
        {children}
      </View>
    </View>
  );
};

// Componente GoldButton con estilo medieval
const GoldButton = ({ onPress, disabled, children, style }: { onPress: () => void, disabled?: boolean, children: React.ReactNode, style?: any }) => (
  <TouchableOpacity
    activeOpacity={1}
    onPress={onPress}
    disabled={disabled}
    className={`py-4 rounded-xl overflow-hidden`}
    style={{
      paddingVertical: 16,
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
    }}>
      <View className="flex-row items-center justify-center gap-3">
        <T className="font-cinzel-bold text-base text-center text-black">
          {children}
        </T>
      </View>
    </View>
  </TouchableOpacity>
);

// HabitCard Component
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
  const getCategoryIcon = (category: string) => {
    const iconProps = { color: 'white', size: 12 };
    switch (category) {
      case 'Physical': return <Dumbbell {...iconProps} />;
      case 'Mental': return <Brain {...iconProps} />;
      case 'Spiritual': return <Heart {...iconProps} />;
      case 'Discipline': return <Target {...iconProps} />;
      case 'Social': return <Users {...iconProps} />;
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
        <View style={styles.habitSelector}>
          <View style={[styles.selectorCircle, isSelected ? styles.selectorCircleSelected : styles.selectorCircleUnselected]}>
            {isSelected && <T className="text-white text-xs font-bold">✓</T>}
          </View>
        </View>
        <View style={styles.habitContent}>
          <View style={styles.habitHeader}>
            <T className="font-cinzel-bold text-white text-base">{habit.name}</T>
            <View style={styles.habitMeta}>
              <View style={styles.categoriesContainer}>
                {habit.categories.map((category: string, index: number) => (
                  <View key={index} style={styles.categoryItem}>
                    {getCategoryIcon(category)}
                    <T className="text-white text-xs font-cinzel ml-1 mb-1">
                      {category === 'Physical' ? 'Físico' : category === 'Mental' ? 'Mental' : category === 'Spiritual' ? 'Espiritual' : category === 'Discipline' ? 'Disciplina' : category === 'Social' ? 'Social' : category === 'NoFap' ? 'NoFap' : category}
                    </T>
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

export default function SelectHabits({ navigation }: any) {
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customizedHabits, setCustomizedHabits] = useState<{[key: string]: {days: boolean[], time: string}}>({});
  const { createHabit } = useHabits();
  const { isSuscribed } = useUser();

  useEffect(() => {
    loadPersonalizedHabits();
  }, []);

  // Habits that can be customized (not abstinence habits)
  const customizableHabits = ['run', 'gym_workout', 'cold_shower', 'meditate', 'read_books', 'journaling', 'sit_up', 'push_up', 'studying' ];

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

  const loadPersonalizedHabits = async () => {
    try {
      // First try to load from personalizedHabits (Profile screen)
      const personalizedHabitsData = await AsyncStorage.getItem('personalizedHabits');
      if (personalizedHabitsData) {
        const personalizedHabits = JSON.parse(personalizedHabitsData);
        setSelectedHabits(personalizedHabits.map((habit: any) => habit.id));
        return;
      }
      
      // Fallback to quiz data
      const quizData = await AsyncStorage.getItem('quizData');
      if (quizData) {
        const parsedData = JSON.parse(quizData);
        const personalizedHabits = parsedData.personalizedHabits || [];
        setSelectedHabits(personalizedHabits.map((habit: any) => habit.id));
      }
    } catch (error) {
      console.error('Error loading personalized habits:', error);
    }
  };

  const toggleHabit = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const handleContinue = async () => {
    if (selectedHabits.length === 0) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Create each selected habit
      for (const habitId of selectedHabits) {
        const predefinedHabit = AVAILABLE_HABITS.find(h => h.id === habitId);
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

      // Navigate to Pricing or Tabs based on user subscription
      if (isSuscribed) {
        navigation.navigate('Tabs');
      } else {
        navigation.navigate('Pricing');
      }
    } catch (error) {
      console.error('Error creating habits:', error);
    } finally {
      setIsLoading(false);
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
          <ScrollView 
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <BlurredCard className="mt-8">
              <View className="items-center">
                <T className="text-2xl font-cinzel-bold text-white text-center mb-2">
                  Plan Especial Personalizado
                </T>
                <T className="text-white/80 text-center mb-2">
                  Hemos seleccionado estos hábitos especialmente para ti basados en tu perfil.
                </T>
                <T className="text-yellow-400 text-center mb-4">
                  Puedes modificar tu plan agregando o quitando hábitos
                </T>
                <T className="text-yellow-400 font-cinzel-bold text-lg">
                  {selectedHabits.length} hábitos seleccionados
                </T>
              </View>
            </BlurredCard>

            {/* Habits List */}
            <BlurredCard>
              <View className="gap-4">
                {AVAILABLE_HABITS.map((habit) => (
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
            </BlurredCard>

            {/* Continue Button */}
            <View className="mt-6">
              <GoldButton
                onPress={handleContinue}
                disabled={selectedHabits.length === 0 || isLoading}
              >
                {isLoading ? 'Creando hábitos...' : '¡Comenzar mi aventura!'}
              </GoldButton>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
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