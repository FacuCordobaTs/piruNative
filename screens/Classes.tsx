import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, SafeAreaView, Image, ImageBackground, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, Animated, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T } from '../components/T';
import { AnimatedButton } from '../components/AnimatedButton';
import { IronAnimatedButton } from '../components/IronAnimatedButton';
import { useUser } from '../context/userProvider';

const backgroundImage = require('../assets/images/forge.jpg');
const monk1 = require('../assets/images/monjenivel1.jpg');
const monk2 = require('../assets/images/monjenivel2.jpg');
const mage1 = require('../assets/images/magonivel1.jpg');
const mage2 = require('../assets/images/magonivel2.jpg');
const warrior1 = require('../assets/images/guerreronivel1.jpg');
const warrior2 = require('../assets/images/guerreronivel2.jpg');

type ClassKey = 'Monje' | 'Mago' | 'Guerrero';

interface ClassInfo {
  key: ClassKey;
  name: string;
  cardImage: any;
  evolveImage: any;
  perks: string[];
}

const CLASSES: ClassInfo[] = [
  {
    key: 'Monje',
    name: 'Monje',
    cardImage: monk1,
    evolveImage: monk2,
    perks: ['+ Puntos en Espiritual', '+ Enfoque y calma mental'],
  },
  {
    key: 'Mago',
    name: 'Mago',
    cardImage: mage1,
    evolveImage: mage2,
    perks: ['+ Puntos en Mental', '+ Aprendizaje y estudio'],
  },
  {
    key: 'Guerrero',
    name: 'Guerrero',
    cardImage: warrior1,
    evolveImage: warrior2,
    perks: ['+ Puntos en Físico', '+ Disciplina férrea'],
  },
];

export default function ClassesScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<ClassKey>('Guerrero');
  const [recommended, setRecommended] = useState<ClassKey | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const { updateClass } = useUser();
  // Bobbing float animation for selected card
  const bobAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bobAnim]);

  // Twinkle particles opacity anims
  const twinkleAnims = useMemo(() => Array.from({ length: 12 }, () => new Animated.Value(0)), []);
  useEffect(() => {
    const anims = twinkleAnims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(200 * i),
          Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [twinkleAnims]);

  // Predefined twinkle positions around the card
  const twinklePositions = useMemo(() => [
    { top: 22, left: 22 },
    { top: 48, right: 30 },
    { top: 76, left: 48 },
    { top: 104, right: 60 },
    { top: 132, left: 24 },
    { top: 164, right: 40 },
    { top: 196, left: 70 },
    { top: 228, right: 72 },
    { top: 260, left: 36 },
    { top: 292, right: 36 },
    { top: 90, left: 90 },
    { top: 210, right: 110 },
  ], []);

  // Glowing overlay for selected card (native-driven opacity pulse)
  const glowAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  // Determine recommendation from quiz/personalized habits
  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        // Try personalizedHabits first
        const personalized = await AsyncStorage.getItem('personalizedHabits');
        let habits: any[] | null = null;
        if (personalized) {
          habits = JSON.parse(personalized);
        } else {
          const quiz = await AsyncStorage.getItem('quizData');
          if (quiz) {
            const data = JSON.parse(quiz);
            habits = data.personalizedHabits || null;
          }
        }

        // Fallback to goals/areas if habits not present
        const quizRaw = await AsyncStorage.getItem('quizData');
        const quizData = quizRaw ? JSON.parse(quizRaw) : null;

        // Simple heuristic: map goals to classes
        let rec: ClassKey = 'Guerrero';
        const goals: string[] = quizData?.goals || [];
        const focusArea: string | undefined = quizData?.focusArea;

        const favorsWarrior = goals.includes('training') || goals.includes('energy') || focusArea === 'physical' || focusArea === 'core';
        const favorsMage = goals.includes('focus') || goals.includes('sleep') || focusArea === 'intellect' || focusArea === 'psyche';
        const favorsMonk = goals.includes('nofap') || focusArea === 'spiritual';

        if (favorsWarrior) rec = 'Guerrero';
        if (favorsMage) rec = 'Mago';
        if (favorsMonk) rec = 'Monje';

        setRecommended(rec);
        setSelected(rec);

        // Scroll to recommended card
        const index = CLASSES.findIndex(c => c.key === rec);
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: index * (width * 0.8 + 16), animated: true });
        }, 100);
      } catch (e) {
        setRecommended('Guerrero');
        setSelected('Guerrero');
      }
    };
    loadRecommendation();
  }, [width]);

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('piru_selected_class', selected);
      await updateClass(selected);
    } catch {}
    navigation.replace('Profile');
  };

  return (
    <ImageBackground source={backgroundImage} className="flex-1" imageStyle={{ resizeMode: 'cover' }}>
      <View className="flex-1 bg-black/70 pt-24">
        <SafeAreaView className="flex-1">
          <View className="px-4">
            <View className="items-center mb-4">
              <T className="text-2xl font-cinzel-bold text-white text-center">Elige tu Clase</T>
              <T className="text-white/80 text-center mt-1">Puedes cambiar tu elección ahora</T>
            </View>

            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              snapToAlignment="start"
              decelerationRate="fast"
              snapToInterval={width * 0.8 + 16}
            >
              {CLASSES.map((cls, index) => {
                const isSelected = selected === cls.key;
                const isRecommended = recommended === cls.key;
                const translateY = isSelected
                  ? bobAnim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] })
                  : 0;
                return (
                  <TouchableOpacity
                    key={cls.key}
                    onPress={() => setSelected(cls.key)}
                    activeOpacity={0.9}
                    style={[styles.cardWrap, { width: width * 0.8 }, isSelected ? styles.cardWrapSelected : styles.cardWrapDefault]}
                  >
                    <Animated.View className="rounded-2xl overflow-hidden" style={{ transform: [{ translateY }] }}>
                      <Image source={cls.cardImage} style={{ width: '100%', height: 320 }} resizeMode="cover" />
                      <View className="bg-black/50 p-4">
                        <View className="flex-row items-center justify-between mb-2">
                          <T className="text-white font-cinzel-bold text-lg">{cls.name}</T>
                          {isRecommended && (
                            <View className="px-2 py-1 rounded bg-yellow-500/20 border border-yellow-400/40">
                              <T className="text-yellow-300 text-xs font-cinzel-bold">Recomendada para ti</T>
                            </View>
                          )}
                        </View>
                        <View className="mb-3">
                          {cls.perks.map((p, i) => (
                            <T key={i} className="text-white/85 text-xs mb-1">{p}</T>
                          ))}
                        </View>
                        {isSelected && (
                          <IronAnimatedButton onPress={() => setShowEvolution(true)}>
                            <View className="items-center">
                              <T className="text-white font-cinzel-bold">Ver evolución</T>
                            </View>
                          </IronAnimatedButton>
                        )}
                      </View>
                      {isSelected && (
                        <>
                          {/* Pulsing glow */}
                          <Animated.View
                            pointerEvents="none"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              borderWidth: 3,
                              borderColor: '#fbbf24',
                              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] }),
                              borderRadius: 16,
                            }}
                          />
                          {/* Twinkles */}
                          {twinklePositions.map((pos, i) => (
                            <Animated.View
                              key={i}
                              pointerEvents="none"
                              style={{
                                position: 'absolute',
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#FFE88A',
                                opacity: twinkleAnims[i % twinkleAnims.length],
                                ...(pos as any),
                              }}
                            />
                          ))}
                        </>
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="mt-6">
              <AnimatedButton onPress={handleContinue}>
                <View className="flex-row items-center justify-center gap-3">
                  <T className="font-cinzel-bold text-black text-center">Continuar</T>
                </View>
              </AnimatedButton>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Evolution Modal */}
      <EvolutionModal
        visible={showEvolution}
        onClose={() => setShowEvolution(false)}
        evolveImage={CLASSES.find(c => c.key === selected)?.evolveImage}
        classNameLabel={selected}
      />
    </ImageBackground>
  );
}

// Evolution modal component with animated reveal
const EvolutionModal = ({ visible, onClose, evolveImage, classNameLabel }: { visible: boolean; onClose: () => void; evolveImage?: any; classNameLabel: string; }) => {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center">
        <Animated.View style={{ transform: [{ scale }], opacity }} className="w-[90%] max-w-sm rounded-2xl overflow-hidden border border-yellow-500/30">
          <View className="bg-black/80 p-4">
            <T className="text-xl font-cinzel-bold text-yellow-300 text-center mb-2">Evolución {classNameLabel}</T>
            {evolveImage && (
              <Image source={evolveImage} style={{ width: '100%', height: 360 }} resizeMode="cover" />
            )}
            <View className="mt-4">
              <AnimatedButton onPress={onClose}>
                <View className="items-center">
                  <T className="text-black font-cinzel-bold">Cerrar</T>
                </View>
              </AnimatedButton>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 16,
    marginHorizontal: 8,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardWrapSelected: {
    borderColor: '#fbbf24',
  },
  cardWrapDefault: {
    borderColor: 'rgba(255,255,255,0.25)',
  },
});


