import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, SafeAreaView, TouchableOpacity, Image, Animated, StyleSheet, ScrollView, ImageBackground, useWindowDimensions, Alert, Modal } from 'react-native';
import { Habit, useHabits } from '../../context/HabitsProvider';
import { useUser } from '../../context/userProvider';
import { useNotifications } from '../../hooks/useNotifications'; 
import { Brain, Dumbbell, Heart, Target, Users, Flame, Plus, Clock, Sword, Trophy, Zap, Edit3, Trash2, X, Loader2, ArrowRight } from 'lucide-react-native';
import { T } from '../../components/T';

// Import images
const mascotImage = require('../../assets/images/piru-transparent.png');
const piruNivel1 = require('../../assets/images/piru-transparent.png');
const piruNivel2 = require('../../assets/images/pirunivel2.png');
const piruNivel3 = require('../../assets/images/pirunivel3.png');
const piruNivel4 = require('../../assets/images/pirunivel4.png');
const backgroundImagenivel = require('../../assets/images/nivel1.jpg');
const backgroundImagenivel2 = require('../../assets/images/nivel2.jpg');
const backgroundImagenivel3 = require('../../assets/images/nivel3.jpg');
const backgroundImagenivel4 = require('../../assets/images/nivel4.jpg');
const backgroundImagenivel5 = require('../../assets/images/nivel5.jpg');
const backgroundImagenivel6 = require('../../assets/images/nivel6.jpg');
const backgroundImagenivel7 = require('../../assets/images/nivel7.jpg');



// Función para obtener el fondo según el nivel del usuario
const getBackgroundByLevel = (level: number) => {
  // Mapeo de niveles a fondos
  const levelRanges = [
    { level: 1, background: backgroundImagenivel },
    { level: 2, background: backgroundImagenivel2 },
    { level: 3, background: backgroundImagenivel3 },
    { level: 4, background: backgroundImagenivel4 },
    { level: 5, background: backgroundImagenivel5 },
    { level: 6, background: backgroundImagenivel6 },
    { level: 7, background: backgroundImagenivel7 },
  ];
  if (level > 7) {
    return backgroundImagenivel7;
  }
  const range = levelRanges.find(r => level == r.level);
  return range ? range.background : backgroundImagenivel;
};

// Lucide React Native icons with consistent styling
const FlameIcon = () => <Flame color="#facc15" size={16} />;
const ClockIcon = () => <Clock color="#facc15" size={16} />;
const SwordIcon = () => <Sword color="#facc15" size={16} />;

const CelebrationAnimation = ({ habit, experienceGained, onDone }: { habit: any; experienceGained: number; onDone: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Twinkle animations
  const twinkleAnimations = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const physicalPoints = habit.physical ? Math.round(experienceGained / 10) : 0;
  const mentalPoints = habit.mental ? Math.round(experienceGained / 10) : 0;
  const spiritualPoints = habit.spiritual ? Math.round(experienceGained / 10) : 0;
  const disciplinePoints = habit.discipline ? Math.round(experienceGained / 10) : 0;
  const socialPoints = habit.social ? Math.round(experienceGained / 10) : 0;

  const statIcon = habit.physical ? <Heart color="#EF4444" size={20} /> : null;
  
  useEffect(() => {
    // Reset animation values
    scaleAnim.setValue(0.5);
    opacityAnim.setValue(0);
    textScaleAnim.setValue(0);
    textOpacityAnim.setValue(0);
    
    // Reset twinkle animations
    twinkleAnimations.forEach(twinkle => {
      twinkle.opacity.setValue(0);
      twinkle.scale.setValue(0);
      twinkle.rotate.setValue(0);
    });

    // Start twinkle animations with staggered delays
    const twinkleAnimationsArray = twinkleAnimations.map((twinkle, index) => {
      const delay = index * 200; // Stagger each twinkle by 200ms
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(twinkle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(twinkle.scale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(twinkle.rotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(twinkle.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(twinkle.scale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.sequence([
      // First: animate the main container in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Wait a bit
      Animated.delay(500),
      // Then: animate the text in and start twinkles
      Animated.parallel([
        Animated.spring(textScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        ...twinkleAnimationsArray,
      ]),
      // Wait longer
      Animated.delay(2000),
      // Finally: fade everything out
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
        onDone();
    });
  }, [habit, onDone, scaleAnim, opacityAnim, textScaleAnim, textOpacityAnim, twinkleAnimations]);
  
  // Generate random positions for twinkles
  const twinklePositions = [
    { top: '15%' as const, left: '20%' as const },
    { top: '25%' as const, right: '15%' as const },
    { top: '35%' as const, left: '10%' as const },
    { top: '45%' as const, right: '25%' as const },
    { top: '55%' as const, left: '30%' as const },
    { top: '65%' as const, right: '10%' as const },
    { top: '75%' as const, left: '15%' as const },
    { top: '85%' as const, right: '20%' as const },
  ];

  return (
    <View className="absolute inset-0 items-center justify-center" style={{ zIndex: 9999 }}>
      {/* Twinkle elements */}
      {twinkleAnimations.map((twinkle, index) => (
        <Animated.View
          key={index}
          className="absolute"
          style={[
            twinklePositions[index],
            {
              opacity: twinkle.opacity,
              transform: [
                { scale: twinkle.scale },
                {
                  rotate: twinkle.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg">
            <View className="absolute inset-0 bg-white rounded-full opacity-60" />
          </View>
        </Animated.View>
      ))}

      {/* Main container with scale and opacity animation */}
      <Animated.View
        className="absolute inset-0 items-center justify-center"
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        {/* Background overlay */}
        <View className="absolute inset-0 bg-black/50" />
        
        {/* Content container */}
        <Animated.View
          className="bg-black/90 rounded-2xl p-6 mx-4 max-w-sm w-full border-2 border-yellow-400/50"
          style={{
            transform: [{ scale: textScaleAnim }],
            opacity: textOpacityAnim,
          }}
        >
          <View className="items-center">
            {/* Experience icon and text */}
            <View className="flex-row items-center gap-2 mb-3">
              <Zap color="#FCD34D" size={24} />
              <T className="text-white text-xl font-cinzel-bold">
                +{experienceGained} XP
              </T>
            </View>
            
            {/* Stat points if applicable */}
            {physicalPoints > 0 && (
              <View className="flex-row items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg my-1">
                {statIcon}
                <T className="text-white text-sm font-cinzel-bold">
                  +{physicalPoints} Pts. en Físico
                </T>
              </View>
            )}
            {mentalPoints > 0 && (
              <View className="flex-row items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg my-1">
                {statIcon}
                <T className="text-white text-sm font-cinzel-bold">
                  +{mentalPoints} Pts. en Mental
                </T>
              </View>
            )}
            {spiritualPoints > 0 && (
              <View className="flex-row items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg my-1">
                {statIcon}
                <T className="text-white text-sm font-cinzel-bold">
                  +{spiritualPoints} Pts. en Espiritual
                </T>
              </View>
            )}
            {disciplinePoints > 0 && (
              <View className="flex-row items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg my-1">
                {statIcon}
                <T className="text-white text-sm font-cinzel-bold">
                  +{disciplinePoints} Pts. en Disciplina
                </T>
              </View>
            )}
            {socialPoints > 0 && (
              <View className="flex-row items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg my-1">
                {statIcon}
                <T className="text-white text-sm font-cinzel-bold">
                  +{socialPoints} Pts. en Social
                </T>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};


const LevelUpModal = ({ levelUpData, visible, onClose }: { levelUpData: any; visible: boolean; onClose: () => void }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center">
        <View className="w-[90%] max-w-sm rounded items-center m-auto h-[500px] border border-white/50">
        {levelUpData?.arenaImage && (
          <Image
            source={levelUpData.arenaImage}
            className="absolute w-full h-full"
            style={{ resizeMode: 'cover', top: 0, left: 0, right: 0, bottom: 0 }}
            blurRadius={1}
          />
        )}
        <View className="absolute inset-0 bg-black/50 rounded" />
        <View className="flex w-full  items-center pt-8 pb-8  bg-black/50 z-10">
          <T className="text-4xl font-cinzel-bold  text-white text-center mb-2">
            ¡NIVEL {levelUpData?.newLevel}!
          </T>
          <T className="text-xl text-gray-300 text-center mt-2">
            ¡Felicitaciones, aventurero!
          </T>
        </View>
        {levelUpData?.arenaName && (
            <View className="w-full p-4 items-center mt-auto">
              <T className="text-lg font-cinzel-bold text-white mb-2">
                Nueva Arena Desbloqueada
              </T>
              <T className="text-2xl font-cinzel-bold text-yellow-400 text-center mb-2">
                {levelUpData?.arenaName}
              </T>
            </View>
          )}

        <View className="flex w-full  items-center  pb-8  bg-black/50 z-10">
          <View className="mt-5">
            {
              levelUpData?.oldLevel && (
                <T className="text-gray-300 text-center">
                  Has avanzado del Nivel {levelUpData.oldLevel} al Nivel {levelUpData.newLevel}.
                </T>
              )
            }
          </View>
          <TouchableOpacity
          style={{
              paddingVertical: 8,
              borderRadius: 12,
              overflow: 'hidden',
            }}
            onPress={onClose}
            className="mt-5"
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
              <T className="text-base font-cinzel-bold text-black">Continuar</T>
            </View>
          </View>
        </TouchableOpacity>
        </View>
        </View>
      </View>
    </Modal>
  );
};

// BlurredCard component for true glassmorphism effect
const BlurredCard = ({ 
  children, 
  style, 
  className, 
  backgroundImage 
}: { 
  children: React.ReactNode, 
  style?: any, 
  className?: string,
  backgroundImage?: any
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
      <Image
        source={backgroundImage || backgroundImagenivel}
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
      <View className="bg-black/30 p-4">
        {children}
      </View>
    </View>
  );
}; 

// Weekly Calendar Component with enhanced styling
const WeeklyCalendar = ({ userLevel }: { userLevel: number }) => {
  const days = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
  
  // --- Lógica para obtener los días reales de la semana ---
  const now = new Date();
  const today = now.getDate();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  // Calcular la fecha del inicio de la semana (Lunes)
  const firstDayOfWeek = new Date(now);
  const diff = currentDay === 0 ? 6 : currentDay - 1; // Diferencia de días hasta el Lunes
  firstDayOfWeek.setDate(today - diff);

  // Generar las fechas para toda la semana
  const dates = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);
      return day.getDate();
  });
  // --- Fin de la lógica ---

  return (
      <BlurredCard className="mb-6" backgroundImage={getBackgroundByLevel(userLevel)}>
          <View className="flex-row items-center mb-4">
              <SwordIcon />
              <T className="text-lg font-cinzel-bold text-white ml-2">Semana del Guerrero</T>
          </View>
          <View className="flex-row justify-between items-center">
              {days.map((day, index) => (
                  <View key={day} className="items-center">
                      <T className="text-xs text-white/70 mb-2">{day}</T>
                      <View
                          className={`w-10 h-10 rounded-full items-center justify-center border border-white/20 bg-white/10 ${
                              dates[index] === today ? 'bg-white/40 scale-110' : ''
                          }`}
                      >
                          <T
                              className={`text-sm font-cinzel-bold ${
                                  dates[index] === today ? 'text-white' : 'text-white/90'
                              }`}
                          >
                              {dates[index]}
                          </T>
                      </View>
                  </View>
              ))}
          </View>
      </BlurredCard>
  );
};

// Mascot Section Component with enhanced styling
const MascotSection = ({ userLevel, user }: { userLevel: number, user: any }) => {
  // Calculate weighted score for pirunivel selection
  const getPiruNivelImage = () => {
    if (!user) return mascotImage; // Fallback to default mascot if user is null
    
    // Calculate NoFap streak (similar to NoFap screen)
    let nofapStreak = 0;
    if (user.lastRelapse) {
      const lastRelapseDate = new Date(user.lastRelapse);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - lastRelapseDate.getTime();
      nofapStreak = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    // Calculate average of all stat points
    const averageStats = (
      user.physicalPoints + 
      user.mentalPoints + 
      user.spiritualPoints + 
      user.disciplinePoints + 
      user.socialPoints
    ) / 5;
    
    // Weighted calculation: 60% NoFap streak, 40% average stats
    const weightedScore = (nofapStreak * 0.6) + (averageStats * 0.4);
    
    // Map weighted score to pirunivel images
    if (weightedScore >= 30) {
      return piruNivel4;
    } else if (weightedScore >= 20) {
      return piruNivel3;
    } else if (weightedScore >= 10) {
      return piruNivel2;
    } else {
      return piruNivel1;
    }
  };

  return (
    <BlurredCard backgroundImage={getBackgroundByLevel(userLevel)}>
      <View className="flex-row items-center gap-4">
        <View className="relative">
          <View className="w-32 h-32 overflow-hidden">
            <Image source={getPiruNivelImage()} className="w-full h-full" style={{ objectFit: 'contain' }} />
          </View>
        </View>
        <View>
          <T className="text-lg font-cinzel-bold text-white">Nivel {userLevel}</T>
          <View className="flex-row items-center">
            <Dumbbell color={'white'} width={15} />
            <T className='text-white font-cinzel  ml-2'>Físico: {user.physicalPoints}</T>
          </View>
          <View className="flex-row items-center">
            <Brain color={'white'} width={15} />
            <T className='text-white font-cinzel  ml-2'>Mental: {user.physicalPoints}</T>
          </View>
          <View className="flex-row items-center">
            <Heart color={'white'} width={15} />
            <T className='text-white font-cinzel  ml-2'>Espiritual: {user.physicalPoints}</T>
          </View>
          <View className="flex-row items-center">
            <Target color={'white'} width={15} />
            <T className='text-white font-cinzel  ml-2'>Disciplina: {user.physicalPoints}</T>
          </View>
          <View className="flex-row items-center">
            <Users color={'white'} width={15} />
            <T className='text-white font-cinzel  ml-2'>Social: {user.physicalPoints}</T>
          </View>
        </View>
      </View>
    </BlurredCard>
  );
};


// Confetti Animation Component
const Confetti = ({ onDone }: { onDone?: () => void }) => {
  const confettiPieces = useMemo(() => {
    const colors = ['#facc15', '#fb923c', '#38bdf8', '#34d399', '#f472b6'];
    return Array.from({ length: 50 }, (_, index) => ({
      id: index,
      translateY: new Animated.Value(-50 - Math.random() * 50),
      translateX: new Animated.Value(0),
      color: colors[index % colors.length],
      left: Math.random() * 300,
    }));
  }, []);

  useEffect(() => {
    // Animate each piece
    const animations = confettiPieces.map((piece: {
      id: number;
      translateY: Animated.Value;
      translateX: Animated.Value;
      color: string;
      left: number;
    }) => {
      const duration = 2000 + Math.random() * 1000;
      const delay = Math.random() * 300;
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(piece.translateY, {
            toValue: 400 + Math.random() * 200,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(piece.translateX, {
            toValue: (Math.random() - 0.5) * 80,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onDone?.();
    });
  }, [confettiPieces, onDone]);

  return (
    <View className="absolute inset-0 z-20" pointerEvents="none">
      {confettiPieces.map((piece: {
        id: number;
        translateY: Animated.Value;
        translateX: Animated.Value;
        color: string;
        left: number;
      }) => (
        <Animated.View
          key={piece.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: piece.color,
            transform: [
              { translateY: piece.translateY },
              { translateX: piece.translateX },
            ],
            left: piece.left,
          }}
        />
      ))}
    </View>
  );
};


// Habit Item Component with enhanced styling
const HabitItem = ({ 
  habit, 
  onComplete, 
  isEditMode = false, 
  onEdit, 
  onDelete,
  isDeleting = false,
  onStartCelebration
}: { 
  habit: Habit, 
  onComplete: (id: number) => void,
  isEditMode?: boolean,
  onEdit?: (habit: Habit) => void,
  onDelete?: (habit: Habit) => Promise<void>,
  isDeleting?: boolean,
  onStartCelebration?: (habit: Habit) => void
}) => {

  const handleComplete = async () => {
    if (!habit.completedToday && !isEditMode) {       
      // Start celebration in parent component
      onStartCelebration?.(habit);
      // Complete the habit immediately
      onComplete(habit.id);
    }
  };

  const handleEdit = () => {
    onEdit?.(habit);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar hábito",
      `¿Estás seguro de que quieres eliminar "${habit.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            await onDelete?.(habit);
          } catch (error) {
            console.error('Error in handleDelete:', error);
          }
        }}
      ]
    );
  };

  if (!habit.completedToday) return (
    <View className="relative">
      <TouchableOpacity
        onPress={handleComplete}
        activeOpacity={0.9}
        style={[
          styles.ironButton,
          isEditMode && { borderWidth: 2, borderColor: '#3b82f6' }
        ]}
      >
      <View
        style={styles.ironButtonGradient}
      >
        <View className="flex-row items-center justify-between p-4"  style={styles.ironButtonBorder}>
          <View className="flex-row items-center gap-4 flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center border-2 border-yellow-400/50 bg-white/10`}
            >
              
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <T
                  className={`text-base text-white font-cinzel-bold`}
                >
                  {habit.name}
                </T>
              </View>
              <View className="flex-row items-center gap-2">
                {habit.physical && <Dumbbell color={'white'} size={24} />}
                {habit.mental && <Brain color={'white'} size={24} />}
                {habit.spiritual && <Heart color={'white'} size={24} />}
                {habit.discipline && <Target color={'white'} size={24} />}
                {habit.social && <Users color={'white'} size={24} />}
              </View>
            </View>
          </View>

          <View className="items-end">
            <View className="flex-row items-center gap-1 mb-1">
              <FlameIcon />
              <T className="text-xl font-cinzel-bold text-yellow-400">{habit.currentStreak}</T>
            </View>
            <View className="flex-row items-center gap-1">
              <ClockIcon />
              <T className="text-xs font-cinzel text-white/70">{habit.reminderTime}</T>
            </View>
          </View>
        </View>
        </View>
      </TouchableOpacity>

      {/* Edit/Delete buttons when in edit mode */}
      {isEditMode && (
        <View className="absolute top-2 right-2 flex-row gap-2">
          <TouchableOpacity
            onPress={handleEdit}
            className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center"
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            <Edit3 color="white" size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              isDeleting ? 'bg-gray-500' : 'bg-red-500'
            }`}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 color="white" size={16} className="animate-spin" />
            ) : (
              <Trash2 color="white" size={16} />
            )}
          </TouchableOpacity>
        </View>
      )}


    </View>

  )

  return (
    <View className="relative">
      <TouchableOpacity
        className={`rounded-2xl border mb-4 p-4`}
        style={[
          { borderColor: 'rgba(255,255,255,0.2)' },
          isEditMode && { borderColor: '#3b82f6', borderWidth: 2 }
        ]}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4 flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center`}
            >
              <FlameIcon />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <T
                  className={`text-base text-white font-cinzel-bold line-through opacity-70`}
                >
                  {habit.name}
                </T>
              </View>
              <View className="flex-row items-center gap-2">
                {habit.physical && <Dumbbell color={'white'} size={24} />}
                {habit.mental && <Brain color={'white'} size={24} />}
                {habit.spiritual && <Heart color={'white'} size={24} />}
                {habit.discipline && <Target color={'white'} size={24} />}
                {habit.social && <Users color={'white'} size={24} />}
              </View>
            </View>
          </View>

          <View className="items-end">
            <View className="flex-row items-center gap-1 mb-1">
              <FlameIcon />
              <T className="text-xl font-cinzel-bold text-yellow-400">{habit.currentStreak}</T>
            </View>
            <View className="flex-row items-center gap-1">
              <ClockIcon />
              <T className="text-xs font-cinzel text-white/70">{habit.reminderTime}</T>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Edit/Delete buttons when in edit mode */}
      {isEditMode && (
        <View className="absolute top-2 right-2 flex-row gap-2">
          <TouchableOpacity
            onPress={handleEdit}
            className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center"
            activeOpacity={0.8}
          >
            <Edit3 color="white" size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              isDeleting ? 'bg-gray-500' : 'bg-red-500'
            }`}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            <Trash2 color="white" size={16} />
          </TouchableOpacity>
        </View>
      )}


    </View>
  );
};

export default function HomePage({navigation}: any) {
  const { habits, completeHabit, refreshHabits, deleteHabit } = useHabits();
  const { user, levelUpData, clearLevelUpData } = useUser();
  const { debugGetAllScheduledNotifications, debugGetStoredNotificationIds, cleanupOrphanedNotifications } = useNotifications();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationHabit, setCelebrationHabit] = useState<Habit | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  useEffect(() => {
    // navigation.navigate('Pricing');
    refreshHabits();
    
    // Limpiar notificaciones huérfanas al cargar la app
    cleanupOrphanedNotifications().catch(error => {
      console.error('Error limpiando notificaciones huérfanas:', error);
    });
  }, []);

  // Show modal when level up data is available
  useEffect(() => {
    if (levelUpData) {
      console.log('🎊 Level up data received in Home:', levelUpData);
      // Show level up modal after a short delay
      setTimeout(() => {
        setShowLevelUpModal(true);
      }, 3500);
    }
  }, [levelUpData]);

  // Obtener el fondo según el nivel del usuario
  const currentBackground = getBackgroundByLevel(user?.level || 1);

  // Separate habits into completed and uncompleted
  const uncompletedHabits = habits.filter((habit: Habit) => !habit.completedToday);
  const completedHabits = habits.filter((habit: Habit) => habit.completedToday);

  const handleEditHabit = (habit: Habit) => {
    // Navigate to edit habit screen with the habit data
    navigation.navigate('EditHabit', { habitId: habit.id.toString() });
  };

  const handleDeleteHabit = async (habit: Habit) => {
    try {
      setDeletingHabitId(habit.id);
      console.log(`=== DELETING HABIT ${habit.id}: ${habit.name} ===`);
      
      // Debug notifications before deletion
      await debugNotifications();
      
      await deleteHabit(habit.id);
      
      // Debug notifications after deletion
      console.log('=== AFTER DELETION ===');
      await debugNotifications();
      
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setDeletingHabitId(null);
    }
  };

  const handleStartCelebration = (habit: Habit) => {
    setCelebrationHabit(habit);
    setShowCelebration(true);
    
    // Auto-hide celebration after 3 seconds
    setTimeout(() => {
      setShowCelebration(false);
      setCelebrationHabit(null);
    }, 3000);
  };

  const handleLevelUpDone = () => {
    setShowLevelUpModal(false);
    clearLevelUpData();
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Debug function to test notification cleanup
  const debugNotifications = async () => {
    console.log('=== DEBUGGING NOTIFICATIONS ===');
    await debugGetAllScheduledNotifications();
    await debugGetStoredNotificationIds();
    console.log('=== END DEBUG ===');
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={currentBackground} className="flex-1">
      <View className="flex-1 bg-black/50">
        <SafeAreaView className="flex-1 pt-8">
          <View className="p-4 max-w-md self-center w-full flex-1">
            {/* Static Header Section */}
            <View className="mb-6">
              {/* Weekly Calendar */}
              <WeeklyCalendar userLevel={user?.level || 1} />

              {/* Mascot Section */}
              <MascotSection userLevel={user?.level || 1} user={user} />
            </View>

            {/* Scrollable Habits Section */}
            <ScrollView 
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 128 }}
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
            >
              
              {/* Arena Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Arenas')}
                className="mb-6"
                activeOpacity={0.9}
                style={{
                  paddingVertical: 8,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <View style={styles.ironButtonBorder}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Sword color="#fbbf24" size={24} />
                      <View>
                        <T className="text-base font-cinzel-bold text-white">Tu Arena Actual</T>
                        <T className="text-sm font-cinzel text-white">
                          {(() => {
                            const level = user?.level || 1;
                            const arenaNames = [
                              'Aldea Pacífica',
                              'Bosque Encantado', 
                              'Puente Ancestral',
                              'Valle Místico',
                              'Castillo Otoñal',
                              'Torre del Dragón',
                              'Ciudadela Celestial'
                            ];
                            return `Arena ${level}: ${arenaNames[level - 1] || 'Desconocida'}`;
                          })()}
                        </T>
                      </View>
                    </View>
                    <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                      <ArrowRight color="white" size={16} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {/* Uncompleted Habits */}
              {uncompletedHabits.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-4 px-2">
                     <Sword color="#facc15" size={20} />
                     <T className="text-white text-lg font-cinzel-bold ml-2">
                       {isEditMode ? 'Editar Hábitos' : 'Habitos Pendientes'}
                     </T>
                     <TouchableOpacity
                        onPress={toggleEditMode}
                        activeOpacity={0.8}
                        className={`px-4 py-2 rounded-lg border bg-gray-600 border-gray-500 ml-4`}
                      >
                        <View className="flex-row items-center gap-2">
                          {
                            isEditMode ? <X color="white" size={16} /> : <Edit3 color="white" size={16} />
                          }
                        </View>
                      </TouchableOpacity>
                   </View>
                  <View className="gap-4">
                                         {uncompletedHabits.map((habit: Habit) => (
                       <HabitItem
                         key={habit.id}
                         habit={habit}
                         onComplete={completeHabit}
                         isEditMode={isEditMode}
                         onEdit={handleEditHabit}
                         onDelete={handleDeleteHabit}
                         isDeleting={deletingHabitId === habit.id}
                         onStartCelebration={handleStartCelebration}
                       />
                     ))}
                  </View>
                </View>
              )}

              {/* Completed Habits */}
              {completedHabits.length > 0 && (
                <View className="mb-6">
                                     <View className="flex-row items-center mb-4 px-2">
                     <Trophy color="#facc15" size={20} />
                     <T className="text-white text-lg font-cinzel-bold ml-2">
                       {isEditMode ? 'Editar Hábitos Completados' : 'Victorias del Día'}
                     </T>
                   </View>
                  <View className="gap-4">
                    {completedHabits.map((habit: Habit) => (
                       <HabitItem
                         key={habit.id}
                         habit={habit}
                         onComplete={completeHabit}
                         isEditMode={isEditMode}
                         onEdit={handleEditHabit}
                         onDelete={handleDeleteHabit}
                         isDeleting={deletingHabitId === habit.id}
                         onStartCelebration={handleStartCelebration}
                       />
                     ))}
                  </View>
                </View>
              )}

              {/* New Habit Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateHabit')}
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
                }}>
                  <View className="flex-row items-center justify-center gap-3">
                    <Plus color={'black'} size={20}/>
                    <T className="text-base font-cinzel-bold text-black">Crear Nuevo Hábito</T>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      {/* Loading Modal for Habit Deletion */}
      {deletingHabitId && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <View className="bg-gray-800 rounded-2xl p-6 mx-4 max-w-sm w-full">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-4">
                <Trash2 color="#facc15" size={32} />
              </View>
              <T className="text-white text-lg font-cinzel-bold text-center mb-2">
                Eliminando hábito
              </T>
              <T className="text-white/70 text-sm text-center mb-2">
                {habits.find(h => h.id === deletingHabitId)?.name || 'Hábito'}
              </T>
              <T className="text-white/70 text-sm text-center">
                Por favor espera...
              </T>
            </View>
          </View>
        </View>
      )}

      </ImageBackground>

      {/* Simple Celebration Modal */}
      {showCelebration && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Confetti />
          <View className="bg-black/60 rounded-2xl p-6 mx-4 max-w-sm w-full border-2 ">
            <View className="items-center">
              {/* Experience icon and text */}
              <View className="flex-row items-center gap-2 mb-3">
                <Zap color="#FCD34D" size={24} />
                <T className="text-white text-xl font-cinzel-bold">
                  +10 XP
                </T>
              </View>
              
              {/* Dynamic Stat points based on habit */}
              {celebrationHabit?.physical && (
                <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg my-1">
                  <Dumbbell color="#EF4444" size={20} />
                  <T className="text-white text-sm font-cinzel-bold">
                    +1 Pts. en Físico
                  </T>
                </View>
              )}
              {celebrationHabit?.mental && (
                <View className="flex-row items-center gap-2   px-3 py-2 rounded-lg my-1">
                  <Brain color="#3B82F6" size={20} />
                  <T className="text-white text-sm font-cinzel-bold">
                    +1 Pts. en Mental
                  </T>
                </View>
              )}
              {celebrationHabit?.spiritual && (
                <View className="flex-row items-center gap-2   px-3 py-2 rounded-lg my-1">
                  <Heart color="#10B981" size={20} />
                  <T className="text-white text-sm font-cinzel-bold">
                    +1 Pts. en Espiritual
                  </T>
                </View>
              )}
              {celebrationHabit?.discipline && (
                <View className="flex-row items-center gap-2  px-3 py-2 rounded-lg my-1">
                  <Target color="#F59E0B" size={20} />
                  <T className="text-white text-sm font-cinzel-bold">
                    +1 Pts. en Disciplina
                  </T>
                </View>
              )}
              {celebrationHabit?.social && (
                <View className="flex-row items-center gap-2   px-3 py-2 rounded-lg my-1">
                  <Users color="#8B5CF6" size={20} />
                  <T className="text-white text-sm font-cinzel-bold">
                    +1 Pts. en Social
                  </T>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Level Up Modal */}
      
      <LevelUpModal 
            levelUpData={levelUpData} 
        visible={showLevelUpModal}
        onClose={handleLevelUpDone}
          />
    </View>
  );
}

const styles = StyleSheet.create({
  // BlurredCard complex positioning styles
  blurredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  }, 
  
  // Celebration card with complex styling
  celebrationCard: {
    padding: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',  
  },
  ironButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
}); 