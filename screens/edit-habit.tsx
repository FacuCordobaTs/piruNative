import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { T } from '../components/T';
import { useHabits } from '../context/HabitsProvider';
import { Dumbbell, Brain, Heart, Target, Users, ArrowLeft } from 'lucide-react-native';
import { useNotifications } from '../hooks/useNotifications';

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
        blurRadius={20}
      />
      <View className="rounded-3xl bg-black/30">
        {children}
      </View>
    </View>
  );
};

// Componente GoldButton con estilo medieval del quiz
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
        <Text className="font-cinzel-bold text-base text-center text-black">
          {children}
        </Text>
      </View>
      </View>
  </TouchableOpacity>
);

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

const DifficultyButton = ({ onPress, active, label }: { onPress: () => void, active: boolean, label: string }) => ( 
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="flex-1">
    <View className={`h-12 rounded-lg justify-center items-center border ${
      active 
        ? 'bg-yellow-400/30 border-yellow-400' 
        : 'bg-white/10 border-white/20'
    }`}>
      <T className="text-white font-cinzel-bold text-sm">{label}</T>
    </View>
  </TouchableOpacity>
);

const CategoryButton = ({ onPress, active, IconComponent }: { onPress: () => void, active: boolean, IconComponent: React.ComponentType<any> }) => ( 
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="flex-1">
    <View className={`h-12 rounded-lg justify-center items-center border ${
      active 
        ? 'bg-yellow-400/30 border-yellow-400' 
        : 'bg-white/10 border-white/20'
    }`}>
      <IconComponent size={20} color="white" />
    </View>
  </TouchableOpacity>
);

// Componentes de iconos con emojis
const SaveIcon = () => <T className="text-lg">💾</T>;

interface FormData {
  name: string;
  description: string;
  selectedDays: boolean[];
  reminderTime: string;
  experienceReward: number;
  categories: boolean[];
}

export default function EditHabitScreen({ navigation, route }: any) {
  const { habitId } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { habits, updateHabit, deleteHabit } = useHabits(); 
  const { hasPermission, requestPermissions } = useNotifications();

  const days = [
    { short: "L", boolean: false },
    { short: "M", boolean: false },
    { short: "M", boolean: false },
    { short: "J", boolean: false },
    { short: "V", boolean: false },
    { short: "S", boolean: false },
    { short: "D", boolean: false },
  ];

  const difficulties = [
    { short: "Fácil", boolean: false, experienceReward: 10 },
    { short: "Medio", boolean: false, experienceReward: 20 },
    { short: "Difícil", boolean: false, experienceReward: 30 },
  ];

  const categories = [
    { icon: Dumbbell, boolean: false },
    { icon: Brain, boolean: false },
    { icon: Heart, boolean: false },
    { icon: Target, boolean: false },
    { icon: Users, boolean: false },
  ]

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    selectedDays: [false, false, false, false, false, false, false],
    reminderTime: '09:00',
    experienceReward: 10,
    categories: [false, false, false, false, false],
  });

  // Load habit data when component mounts
  useEffect(() => {
    if (habitId && habits.length > 0) {
      const habit = habits.find(h => h.id === parseInt(habitId));
      if (habit) {
        setFormData({
          name: habit.name || '',
          description: habit.description || '',
          selectedDays: habit.targetDays || [false, false, false, false, false, false, false],
          reminderTime: habit.reminderTime || '09:00',
          experienceReward: habit.experienceReward || 10,
          categories: [
            habit.physical || false,
            habit.mental || false,
            habit.spiritual || false,
            habit.discipline || false,
            habit.social || false,
          ],
        });
      } else {
        Alert.alert('Error', 'Hábito no encontrado');
        navigation.goBack();
      }
      setIsLoading(false);
    } else if (habits.length === 0) {
      // If habits array is empty, wait a bit more
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [habitId, habits]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (pos: number) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays
        ? prev.selectedDays.map((d, i) => i === pos ? !d : d)
        : [...prev.selectedDays, true],
    }));
  };

  const toggleCategory = (pos: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((c, i) => i === pos ? !c : c)
    }));
  };

  const handleUpdateHabit = async () => {
    if (!habitId) {
      Alert.alert('Error', 'ID de hábito no válido');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del hábito es requerido');
      return;
    }

    if (formData.selectedDays.every(day => !day)) {
      Alert.alert('Error', 'Debes seleccionar al menos un día');
      return;
    }

    // Verificar permisos de notificación si se modificaron días u horario
    const currentHabit = habits.find(h => h.id === parseInt(habitId));
    const daysChanged = currentHabit && JSON.stringify(currentHabit.targetDays) !== JSON.stringify(formData.selectedDays);
    const timeChanged = currentHabit && currentHabit.reminderTime !== formData.reminderTime;
    
    if ((daysChanged || timeChanged) && !hasPermission) {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        Alert.alert(
          'Permisos requeridos',
          'Para actualizar los recordatorios de tu hábito, necesitas permitir las notificaciones.',
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
      
      // Create update object with only defined values
      const updateData: any = {
        name: formData.name.trim(),
        targetDays: formData.selectedDays,
        experienceReward: formData.experienceReward,
        reminderTime: formData.reminderTime,
      };

      // Only add description if it's not empty
      if (formData.description.trim()) {
        updateData.description = formData.description.trim();
      }

      // Add category flags
      updateData.physical = formData.categories[0] || false;
      updateData.mental = formData.categories[1] || false;
      updateData.spiritual = formData.categories[2] || false;
      updateData.discipline = formData.categories[3] || false;
      updateData.social = formData.categories[4] || false;

      await updateHabit(parseInt(habitId), updateData);

      Alert.alert('Éxito', 'Hábito actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'No se pudo actualizar el hábito. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHabit = () => {
    Alert.alert(
      'Eliminar hábito',
      '¿Estás seguro de que quieres eliminar este hábito? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!habitId) {
                Alert.alert('Error', 'ID de hábito no válido');
                return;
              }
              await deleteHabit(parseInt(habitId));
              Alert.alert('Éxito', 'Hábito eliminado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'No se pudo eliminar el hábito. Intenta nuevamente.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1">
        <ImageBackground
          source={backgroundImage}
          className="flex-1"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/50" />
          <SafeAreaView className="flex-1">
            <View className="flex-1 justify-center items-center">
              <T className="text-white text-lg font-cinzel-bold">Cargando hábito...</T>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ImageBackground
        source={backgroundImage}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/50" />

        <SafeAreaView className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

            {/* Header with back button */}
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                activeOpacity={0.8}
              >
                <ArrowLeft color="white" size={20} />
              </TouchableOpacity>
              <BlurredCard className="flex-1 mx-4">
                <View className="flex-row items-center justify-center p-3">
                  <T className="text-lg font-cinzel-bold text-white">Editar Hábito</T>
                </View>
              </BlurredCard>
              <TouchableOpacity
                onPress={handleDeleteHabit}
                className="w-10 h-10 rounded-full bg-red-500/80 items-center justify-center"
                activeOpacity={0.8}
              >
                <T className="text-white text-lg">🗑️</T>
              </TouchableOpacity>
            </View>

            {/* Card principal para el formulario */}
            <BlurredCard className="rounded-3xl mb-5">
              <View className="flex-1 p-6">
                {/* Nombre del Hábito */}
                <T className="text-xl font-cinzel-bold text-white mb-4 mt-4">Nombre del hábito</T>
                <TextInput
                style={styles.textInput}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Ej: Meditación matutina"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  className="h-16 bg-white/10 rounded-xl px-4 text-white text-base border border-white/20"
                  maxLength={255}
                />

                {/* Descripción del Hábito */}
                <T className="text-xl font-cinzel-bold text-white mb-4 mt-8">Descripción (opcional)</T>
                <TextInput
                  style={styles.textInput}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Describe tu hábito..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  className="h-20 bg-white/10 rounded-xl px-4 text-white text-base border border-white/20"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />

                {/* Selección de días */}
                <T className="text-xl font-cinzel-bold text-white mb-4 mt-8">¿Qué días lo harás?</T>
                <View className="flex-row flex-wrap justify-between gap-2">
                  {days.map((day, index) => (
                    <DayButton
                      key={index}
                      label={day.short}
                      active={formData.selectedDays[index]}
                      onPress={() => toggleDay(index)}
                    />
                  ))}
                </View>

                {/* Hora del Recordatorio */}
                <T className="text-xl font-cinzel-bold text-white mb-4 mt-8">Hora del Recordatorio</T>
                <View className="flex-row items-center justify-center gap-2.5">
                  <TextInput
                    value={formData.reminderTime.split(':')[0]}
                    onChangeText={(value) => {
                      // Allow empty input while typing
                      if (value === '') {
                        handleInputChange('reminderTime', `:${formData.reminderTime.split(':')[1]}`);
                        return;
                      }
                      
                      // Validate numeric input
                      const numericValue = parseInt(value);
                      if (isNaN(numericValue)) return; // Don't update if not a valid number
                      
                      const hour = Math.max(0, Math.min(23, numericValue));
                      // Don't pad while typing - only store the actual input value
                      handleInputChange('reminderTime', `${hour}:${formData.reminderTime.split(':')[1]}`);
                    }}
                    onBlur={() => {
                      // Pad with zero when user finishes typing (loses focus)
                      const currentHour = formData.reminderTime.split(':')[0];
                      if (currentHour && !isNaN(parseInt(currentHour))) {
                        const hour = Math.max(0, Math.min(23, parseInt(currentHour)));
                        handleInputChange('reminderTime', `${hour.toString().padStart(2, '0')}:${formData.reminderTime.split(':')[1]}`);
                      }
                    }}
                    className="h-12 w-15 bg-white/10 rounded-xl px-2 text-white text-lg text-center border border-white/20"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <T className="text-white text-2xl font-bold">:</T>
                  <TextInput
                    value={formData.reminderTime.split(':')[1]}
                    onChangeText={(value) => {
                      // Allow empty input while typing
                      if (value === '') {
                        handleInputChange('reminderTime', `${formData.reminderTime.split(':')[0]}:`);
                        return;
                      }
                      
                      // Validate numeric input
                      const numericValue = parseInt(value);
                      if (isNaN(numericValue)) return; // Don't update if not a valid number
                      
                      const minute = Math.max(0, Math.min(59, numericValue));
                      // Don't pad while typing - only store the actual input value
                      handleInputChange('reminderTime', `${formData.reminderTime.split(':')[0]}:${minute}`);
                    }}
                    onBlur={() => {
                      // Pad with zero when user finishes typing (loses focus)
                      const currentMinute = formData.reminderTime.split(':')[1];
                      if (currentMinute && !isNaN(parseInt(currentMinute))) {
                        const minute = Math.max(0, Math.min(59, parseInt(currentMinute)));
                        handleInputChange('reminderTime', `${formData.reminderTime.split(':')[0]}:${minute.toString().padStart(2, '0')}`);
                      }
                    }}
                    className="h-12 w-15 bg-white/10 rounded-xl px-2 text-white text-lg text-center border border-white/20"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                {/* Recompensa de Experiencia (simplificado para el nuevo estilo) */}
                <T className="text-xl font-cinzel-bold text-white mb-4 mt-8">Dificultad</T>
                <View className="flex-row flex-wrap justify-between gap-2">
                  {difficulties.map((difficulty, index) => (
                    <DifficultyButton
                      key={index}
                      label={difficulty.short}
                      active={formData.experienceReward === difficulty.experienceReward}
                      onPress={() => handleInputChange('experienceReward', difficulty.experienceReward)}
                    />
                  ))}
                </View>

                
                {/*Categorías */}
                <T className="text-xl font-cinzel-bold text-white mb-4 mt-8">Categorías</T>
                <View className="flex-row flex-wrap justify-between gap-2">
                  {categories.map((category, index) => (
                    <CategoryButton
                      key={index}
                      IconComponent={category.icon}
                      active={formData.categories[index]}
                      onPress={() => toggleCategory(index)}
                    />
                  ))}
                </View>
              </View>
            </BlurredCard>

            {/* Botón de envío */}
            <View className="py-5 px-2.5">
              <GoldButton
                onPress={handleUpdateHabit}
                disabled={!formData.name.trim() || formData.selectedDays.every(day => !day) || isSubmitting}
                style={styles.submitButton}
              >
                <View className="flex-row items-center justify-center">
                  <SaveIcon />
                  <T className="ml-2 text-black font-cinzel-bold text-base">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </T>
                </View>
              </GoldButton>
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
});
