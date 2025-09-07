import React from 'react';
import { View, Text, SafeAreaView, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '../context/userProvider';
import { T } from '../components/T';
import { ArrowLeft, Lock, Sword } from 'lucide-react-native';

// Import arena background images
const backgroundImagenivel = require('../assets/images/nivel1.jpg');
const backgroundImagenivel2 = require('../assets/images/nivel2.jpg');
const backgroundImagenivel3 = require('../assets/images/nivel3.jpg');
const backgroundImagenivel4 = require('../assets/images/nivel5.jpg');
const backgroundImagenivel5 = require('../assets/images/nivel4.jpg');
const backgroundImagenivel6 = require('../assets/images/nivel6.jpg');
const backgroundImagenivel7 = require('../assets/images/nivel7.jpg');

// Function to get background by level (same as Home screen)
const getBackgroundByLevel = (level: number) => {
  const levelRanges = [
    { level: 1, background: backgroundImagenivel },
    { level: 2, background: backgroundImagenivel2 },
    { level: 3, background: backgroundImagenivel3 },
    { level: 4, background: backgroundImagenivel4 },
    { level: 5, background: backgroundImagenivel5 },
    { level: 6, background: backgroundImagenivel6 },
    { level: 7, background: backgroundImagenivel7 },
  ];
  
  const range = levelRanges.find(r => level == r.level);
  return range ? range.background : backgroundImagenivel;
};

export default function ArenasScreen({ navigation }: any) {
  const { user } = useUser();
  const currentLevel = user?.level || 1;
  const currentBackground = getBackgroundByLevel(currentLevel);

  // Arena levels data
  const arenaLevels = [
    { level: 1, name: 'Aldea Pacífica', image: require('../assets/images/nivel1.jpg') },
    { level: 2, name: 'Bosque Encantado', image: require('../assets/images/nivel2.jpg') },
    { level: 3, name: 'Puente Ancestral', image: require('../assets/images/nivel3.jpg') },
    { level: 4, name: 'Valle Místico', image: require('../assets/images/nivel4.jpg') },
    { level: 5, name: 'Castillo Otoñal', image: require('../assets/images/nivel5.jpg') },
    { level: 6, name: 'Torre del Dragón', image: require('../assets/images/nivel6.jpg') },
    { level: 7, name: 'Ciudadela Celestial', image: require('../assets/images/nivel7.jpg') },
  ];

  return (
    <View style={styles.container}>
      <Image source={currentBackground} style={styles.backgroundImage} />
      <View style={styles.overlay} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Header */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View className="flex-row items-center justify-center gap-2 mb-2">
                <Sword color="#facc15" size={24} />
                <T className="text-white text-2xl font-cinzel-bold">Arenas del Guerrero</T>
              </View>
              <T className="text-white/80 text-center text-base">
                Tu nivel actual: <Text style={{ color: '#fbbf24', fontWeight: '700' }}>Arena {currentLevel}</Text>
              </T>
            </View>
          </View>

          {/* Arena Cards */}
          <View style={styles.arenasContainer}>
            {arenaLevels.slice().reverse().map((arena) => {
              const isCurrent = arena.level === currentLevel;
              const isUnlocked = arena.level <= currentLevel;
              
              return (
                <View
                  key={arena.level}
                  style={[
                    styles.arenaCard,
                    isCurrent ? styles.arenaCardCurrent : styles.arenaCardDefault,
                    !isUnlocked && styles.arenaCardLocked,
                  ]}
                >
                  <Image source={arena.image} style={styles.arenaImage} />
                  <View style={styles.arenaOverlay} />
                  
                  {/* Lock overlay for locked arenas */}
                  {!isUnlocked && (
                    <View style={styles.lockOverlay}>
                      <View style={styles.lockIcon}>
                        <Lock color="white" size={24} />
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.arenaTextWrap}>
                    <Text 
                      style={[
                        styles.arenaLevel, 
                        { color: isCurrent ? '#fbbf24' : isUnlocked ? '#fff' : 'rgba(255,255,255,0.5)' }
                      ]} 
                      className='font-cinzel-bold'
                    >
                      Arena {arena.level}
                    </Text>
                    <Text 
                      style={[
                        styles.arenaName,
                        { color: isUnlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }
                      ]} 
                      className='font-cinzel'
                    >
                      {arena.name}
                    </Text>
                  </View>
                  
                  {isCurrent && (
                    <View style={styles.arenaBadgeWrap}>
                      <View style={styles.arenaBadge}>
                        <Text style={styles.arenaBadgeText} className='font-cinzel-bold'>ACTUAL</Text>
                      </View>
                    </View>
                  )}
                  
                  {!isUnlocked && (
                    <View style={styles.arenaBadgeWrap}>
                      <View style={styles.arenaBadgeLocked}>
                        <Text style={styles.arenaBadgeTextLocked} className='font-cinzel-bold'>
                          Nivel {arena.level}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Progress Info */}
          <View style={styles.progressCard}>
            <T className="text-white text-lg font-cinzel-bold text-center mb-2">
              Progreso de Desbloqueo
            </T>
            <T className="text-white/80 text-center text-sm mb-4">
              Has desbloqueado {currentLevel} de {arenaLevels.length} arenas
            </T>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentLevel / arenaLevels.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 32,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 32,
    marginTop: 48,
    position: 'relative',
  },
  backButton: {
    top: 36,
    left: 20,
    position: 'absolute',
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  arenasContainer: {
    marginBottom: 32,
  },
  arenaCard: {
    width: 300,
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 'auto',
    borderWidth: 2,
    marginBottom: 24,
    position: 'relative',
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
  arenaCardLocked: {
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.6,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  lockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  lockText: {
    fontSize: 32,
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
  arenaBadgeLocked: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  arenaBadgeTextLocked: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 48,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
});

