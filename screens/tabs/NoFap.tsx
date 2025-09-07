import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image, ImageBackground, ScrollView, Animated, Modal } from "react-native";
import { Hand, Zap, RotateCcw, Shield, Wind, Brain, Target, Heart, Pause, Play, CheckCircle } from "lucide-react-native";

import { useUser } from "../../context/userProvider";
import { useHabits } from "../../context/HabitsProvider";
 
// Tab button style for better visual feedback
const TabButton = ({ children, onPress, isActive }: { children: React.ReactNode, onPress: () => void, isActive: boolean }) => (
  <TouchableOpacity onPress={onPress} className={`flex-1 rounded-full py-2 px-4 items-center flex-row justify-center gap-2 ${isActive ? 'bg-white/20' : 'bg-transparent'}`}>
    {children}
  </TouchableOpacity>
);

// Nuevo componente para el modal de Juramento
const OathModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#4a4a4a] w-full max-w-sm">
          {!submitted ? (
            <>
              <View className="flex-row items-center gap-2 mb-4">
                <Hand color="#d4af37" size={24} />
                <Text className="text-yellow-400 text-lg font-bold">Haz tu Juramento</Text>
              </View>
              <View className="mb-4">
                <Text className="text-white text-base text-center leading-6">
                  "Prometo con honor y disciplina, resistir las tentaciones y forjar un mejor yo. Cada día es una batalla, y mi voluntad es mi espada. Mantenerme firme es mi mayor victoria."
                </Text>
              </View>
              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity onPress={handleConfirm} className="flex-1 bg-yellow-500 rounded-xl py-3 items-center justify-center">
                  <Text className="text-black font-bold">Juro</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View className="text-center py-8 space-y-3 items-center">
              <CheckCircle color="#10B981" size={48} />
              <Text className="text-yellow-400 font-extrabold text-xl">Juramento Cumplido</Text>
              <Text className="text-sm text-white/80 text-center">
                Tu compromiso ha sido reforzado.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const RelapseModal = ({ visible, onClose, onRelapseRecorded }: { visible: boolean, onClose: () => void, onRelapseRecorded?: () => void }) => {
  const [submitted, setSubmitted] = useState(false);

  const { recordRelapse } = useHabits();
  const { recordRelapse: recordRelapseUser } = useUser();

  const handleRelapse = async (reason: string) => {
    await recordRelapse(reason);
    await recordRelapseUser();
    // Call the callback to refresh relapses data
    if (onRelapseRecorded) {
      onRelapseRecorded();
    }
  };

  const submit = (relapseReason: string) => {
    handleRelapse(relapseReason);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 4000);
  };

  const reasons = [
    { reason: "Estrés", icon: "🤯" },
    { reason: "Aburrido", icon: "😑" },
    { reason: "Curiosidad", icon: "🧐" },
    { reason: "Soledad", icon: "😔" },
    { reason: "Gatillo (contenido)", icon: "📱" },
    { reason: "Fatiga", icon: "😴" },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#4a4a4a] w-full max-w-sm">
          {!submitted ? (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-yellow-400 text-lg font-cinzel">Registrar Recaída</Text>
                </View>
              </View>
              <View className="mb-4">
                <Text className="text-white text-lg font-cinzel-bold text-center mb-4">
                  Reconocer una caída es el primer paso para levantarse. Tu sinceridad es tu escudo.
                </Text>
                <Text className="text-white text-sm text-center mb-4 font-cinzel">
                  ¿Cuál fue la razón de tu recaída?
                </Text>
                <View className="flex-row flex-wrap justify-center gap-3">
                  {reasons.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => submit(item.reason)}
                      className="flex-col items-center justify-center p-1 rounded-lg bg-[#2e2e2e] w-24 h-28"
                    >
                      <Text className="text-4xl">{item.icon}</Text>
                      <Text className="text-white text-xs mt-1 text-center font-cinzel">{item.reason}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity onPress={onClose} className="flex-1 bg-[#4a4a4a] rounded-xl py-3 items-center justify-center">
                  <Text className="text-white font-cinzel-bold">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View className="text-center py-8 space-y-3 items-center">
              <Text className="text-5xl">🌱</Text>
              <Text className="text-yellow-400 font-cinzel-bold text-xl">Hecho con Coraje</Text>
              <Text className="text-sm text-white/80 text-center font-cinzel">
                Cada caída es información para fortalecerte. Seguí adelante.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Se agregó una mejor animación para la respiración
const BreathingAnimation = ({ active, onPhaseChange }: { active: boolean; onPhaseChange: (phase: string) => void }) => {
  const sizeAnim = useState(new Animated.Value(80))[0];

  useEffect(() => {
    if (!active) {
      sizeAnim.setValue(80);
      return;
    }

    const animate = () => {
      Animated.timing(sizeAnim, {
        toValue: 200,
        duration: 4000,
        useNativeDriver: false,
      }).start(() => {
        onPhaseChange("hold");
        setTimeout(() => {
          Animated.timing(sizeAnim, {
            toValue: 80,
            duration: 4000,
            useNativeDriver: false,
          }).start(() => {
            onPhaseChange("inhale");
            animate();
          });
        }, 4000);
      });
    };

    onPhaseChange("inhale");
    animate();

    return () => {
      sizeAnim.stopAnimation();
    };
  }, [active]);

  const circleStyles = {
    width: sizeAnim,
    height: sizeAnim,
    borderRadius: 1000,
    backgroundColor: 'rgba(251, 191, 36, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <View className="w-full items-center justify-center">
      <Animated.View style={circleStyles as any} />
    </View>
  );
};

const EmergencyModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [tab, setTab] = useState("tips");
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("inhale");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (active && phase === "inhale") {
      setCycle(c => c + 1);
    }
  }, [phase, active]);

  const handleBreathingPhaseChange = (newPhase: string) => {
    setPhase(newPhase);
    if (newPhase === "inhale" && cycle >= 5) {
      setActive(false);
      setCycle(0);
      setPhase("inhale");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#4a4a4a] w-full max-w-sm">
          <View className="flex-row items-center gap-2 mb-4">
            <Shield color="#d4af37" size={24} />
            <Text className="text-yellow-400 text-lg font-bold">Escudo de Emergencia</Text>
          </View>
          <View className="mb-4">
            <View className="flex-row bg-[#2e2e2e] rounded-xl p-1 mb-4">
              <TabButton onPress={() => setTab("tips")} isActive={tab === "tips"}>
                <Brain color="white" size={16} />
                <Text className="text-white">Tips</Text>
              </TabButton>
              <TabButton onPress={() => setTab("breathing")} isActive={tab === "breathing"}>
                <Wind color="white" size={16} />
                <Text className="text-white">Respiración</Text>
              </TabButton>
            </View>
            {tab === "tips" && (
              <View className="space-y-2">
                {[
                  { icon: Brain, t: "Reconoce el impulso", d: "Es temporal. Pasará." },
                  { icon: Target, t: "Visualiza tu objetivo", d: "Recordá por qué empezaste." },
                  { icon: Zap, t: "Cambiá de actividad", d: "Caminar, ejercicio, llamar a alguien." },
                  { icon: Heart, t: "Autocompasión", d: "Sos humano. Enfocate en responder mejor." },
                ].map((x, i) => (
                  <View key={i} className="flex-row items-center p-3 my-1 rounded-lg bg-[#2e2e2e]">
                    <x.icon color="#d4af37" size={20} />
                    <View className="flex-1 ml-3">
                      <Text className="font-bold text-white text-base">{x.t}</Text>
                      <Text className="text-xs text-white/70">{x.d}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {tab === "breathing" && (
              <View className="p-4 text-center space-y-3 bg-[#2e2e2e] rounded-lg items-center">
                <Text className="font-bold text-white text-lg">Ejercicio 4-4-4</Text>
                <Text className="text-yellow-400 text-lg">
                  {active ? (phase === "inhale" ? "Inhalá..." : phase === "hold" ? "Mantené..." : "Exhalá...") : "Inicia el ejercicio"}
                </Text>
                <BreathingAnimation active={active} onPhaseChange={handleBreathingPhaseChange} />
                <Text className="text-xs text-white/70">Ciclo: {cycle}/5</Text>
                <View className="flex-row gap-2 w-full mt-2">
                  <TouchableOpacity onPress={() => setActive(!active)} className="flex-1 bg-yellow-500 rounded-xl py-3 items-center justify-center flex-row gap-2">
                    {active ? <><Pause color="black" size={16} /><Text className="text-black font-bold"> Pausar</Text></> : <><Play color="black" size={16} /><Text className="text-black font-bold"> Iniciar</Text></>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setActive(false); setPhase("inhale"); setCycle(0); }} className="flex-1 bg-[#4a4a4a] rounded-xl py-3 items-center justify-center flex-row gap-2">
                    <RotateCcw color="white" size={16} />
                    <Text className="text-white font-bold">Reiniciar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};


// Asegúrate de tener estas imágenes en tu carpeta de assets
const backgroundImage1 = require("../../assets/images/nofap-landscape1.jpg");
const backgroundImage2 = require("../../assets/images/nofap-landscape2.jpg");
const backgroundImage3 = require("../../assets/images/nofap-landscape3.jpg");
const backgroundImage4 = require("../../assets/images/nofap-landscape5.jpg");
const backgroundImage5 = require("../../assets/images/nofap-landscape4.jpg");
const backgroundImage6 = require("../../assets/images/nofap-landscape4.jpg");
const backgroundImage7 = require("../../assets/images/nofap-landscape4.jpg");
const fireImage = require("../../assets/images/piru-logo-transparente.webp");
const bigStreakImage = require("../../assets/images/big-streak.png");
const brokeStreakImage = require("../../assets/images/broke-streak.png");

// Function to get the appropriate background image based on day of week
const getBackgroundImageByDay = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  switch (dayOfWeek) {
    case 0: // Sunday
    case 1: // Monday
      return backgroundImage1;
    case 2: // Tuesday
      return backgroundImage2;
    case 3: // Wednesday
      return backgroundImage3;
    case 4: // Thursday
      return backgroundImage4;
    case 5: // Friday
      return backgroundImage5;
    case 6: // Saturday
      return backgroundImage6;
    default:
      return backgroundImage1;
  }
};

// Function to get the appropriate fire image based on streak and relapse status
const getFireImage = (relapses: any[], currentStreakDays: number) => {
  const now = new Date();
  
  // Check if there's a relapse within the last 24 hours
  if (Array.isArray(relapses) && relapses.length > 0) {
    const recentRelapse = relapses.find((relapse: any) => {
      const relapseDate = new Date(relapse.relapseDate);
      const timeDiff = now.getTime() - relapseDate.getTime();
      const hoursSinceRelapse = timeDiff / (1000 * 60 * 60);
      return hoursSinceRelapse < 24;
    });
    
    // If there's a relapse within last 24 hours, show broke streak image
    if (recentRelapse) {
      return brokeStreakImage;
    }
  }
  
  // If streak is 10 days or more, show big streak image
  if (currentStreakDays >= 10) {
    return bigStreakImage;
  }
  
  // Default case: show regular fire image
  return fireImage;
};

export default function NoFapScreen({navigation}: any) {
  const [showEmergency, setShowEmergency] = useState(false);
  const [showRelapse, setShowRelapse] = useState(false);
  const [showOath, setShowOath] = useState(false); 
  const [currentTime, setCurrentTime] = useState({ days: 0, hours: 23, minutes: 2, seconds: 8 });
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [relapses, setRelapses] = useState<any[]>([]);
  const { user } = useUser();
  const lastRelapse = user?.lastRelapse;
  const { getRelapses } = useHabits();

  const refreshRelapsesData = async () => {
    try {
      const relapsesData = await getRelapses();
      setRelapses(relapsesData || []);
      
      // Also refresh weekly progress
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date);
      }
      
      const weeklyProgress = last7Days.map(date => {
        const dayString = date.toDateString();
        
        const hasRelapse = Array.isArray(relapsesData) && relapsesData.some((relapse: any) => {
          const relapseDate = new Date(relapse.relapseDate);
          return relapseDate.toDateString() === dayString;
        });
        
        return {
          day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
          status: hasRelapse ? 'fail' : 'success'
        };
      });
      
      setWeeklyProgress(weeklyProgress);
    } catch (error) {
      console.error('Error refreshing relapses:', error);
      setRelapses([]);
    }
  };

  useEffect(() => {
    const fetchRelapses = async () => {
      try {
        const relapsesData = await getRelapses();
        
        // Store relapses in state for fire image logic
        setRelapses(relapsesData || []);
        
        // Generate the last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push(date);
        }
        
        // Create weekly progress for the last 7 days
        const weeklyProgress = last7Days.map(date => {
          const dayString = date.toDateString();
          
          // Check if there's a relapse on this day
          const hasRelapse = Array.isArray(relapsesData) && relapsesData.some((relapse: any) => {
            const relapseDate = new Date(relapse.relapseDate);
            return relapseDate.toDateString() === dayString;
          });
          
          return {
            day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
            status: hasRelapse ? 'fail' : 'success'
          };
        });
        
        console.log('Weekly progress:', weeklyProgress); // Debug log
        setWeeklyProgress(weeklyProgress);
      } catch (error) {
        console.error('Error fetching relapses:', error);
        
        // Fallback: Generate 7 days with all success if there's an error
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push({
            day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
            status: 'success'
          });
        }
        setWeeklyProgress(last7Days);
        setRelapses([]); // Set empty array on error
      }
    };
    fetchRelapses();
  }, []);

  useEffect(() => {
    if (lastRelapse) {
      const lastRelapseDate = new Date(lastRelapse);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - lastRelapseDate.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      setCurrentTime({ days, hours, minutes, seconds });
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        let newSeconds = prev.seconds + 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;
        let newDays = prev.days;

        if (newSeconds >= 60) {
          newSeconds = 0;
          newMinutes += 1;
        }
        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours += 1;
        }
        if (newHours >= 24) {
          newHours = 0;
          newDays += 1;
        }

        return { days: newDays, hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.lastRelapse]);
  
  return (
    <ImageBackground
      source={getBackgroundImageByDay()}
      className="flex-1"
      imageStyle={{ resizeMode: "cover" }}
      style={{}} // Empty style for compatibility with NativeWind
    >
      <View className="flex-1 bg-black/70">
        <SafeAreaView className="flex-1">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 128, paddingBottom: 128 }}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View className="relative z-10 w-full">

            {/* Circular Image - Fire */}
            <View className="flex justify-center items-center">
              <View className="relative w-48 h-48 overflow-hidden">
                <Image source={getFireImage(relapses, currentTime.days)} className="w-full h-full object-cover" />
                <View className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </View>
            </View>

            {/* Streak Card */}
            <View className="backdrop-blur-xl rounded-2xl p-6 mb-8">
              <View className="text-center">
                <Text className="text-white/80 text-lg mb-2 font-cinzel text-center">Has estado libre de tentaciones por:</Text>
                <View className="flex-row justify-center items-end mb-2">
                  <Text className="text-white text-6xl font-cinzel-bold">{currentTime.days}</Text>
                  <Text className="text-white text-3xl font-cinzel ml-2">días</Text>
                </View>
                <Text className="text-white/60 text-lg font-cinzel text-center">
                  {currentTime.hours}h {currentTime.minutes}m {currentTime.seconds}s
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-center mb-8">
              <TouchableOpacity
                onPress={() => setShowOath(true)} // Añadido el evento para abrir el modal de juramento
                className="flex-col items-center gap-2 text-white/80 mx-4"
                activeOpacity={0.8}
              >
                <View className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Hand color="white" size={24} />
                </View>
                <Text className="text-sm font-cinzel text-white/80">Juramento</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowRelapse(true)}
                className="flex-col items-center gap-2 text-white/80 mx-4"
                activeOpacity={0.8}
              >
                <View className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <RotateCcw color="white" size={24} />
                </View>
                <Text className="text-sm font-cinzel text-white/80">Reiniciar</Text>
              </TouchableOpacity>
            </View>

            {/* Panic Button */}
            <TouchableOpacity
              onPress={() => setShowEmergency(true)}
              className="w-full bg-[#3a1a1a] text-white font-bold py-4 px-6 rounded-2xl shadow-lg border-2 border-red-800 flex items-center justify-center flex-row gap-2 font-cinzel"
              activeOpacity={0.8}
            >
              <Shield color="white" size={20} />
              <Text className="text-white text-lg font-bold">⚠️ Botón de Pánico</Text>
            </TouchableOpacity>

            {/* Weekly Progress */}
            <View className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 mt-6">
              <Text className="text-white font-medium font-cinzel mb-3">Progreso Semanal</Text>
              <View className="flex-row justify-between">
                {weeklyProgress.length > 0 ? weeklyProgress.map((day, index) => (
                  <View key={index} className="items-center">
                    <View className={`w-10 h-10 rounded-full border-2 items-center justify-center ${
                      day.status === 'success' ? 'bg-green-500/30 border-green-400' : 'bg-red-500/30 border-red-400'
                    }`}>
                      <Text className="text-white font-bold text-xs">
                        {day.status === 'success' ? '✓' : '✗'}
                      </Text>
                    </View>
                    <Text className="text-white/70 text-xs mt-1 font-cinzel">{day.day}</Text>
                  </View>
                )) : (
                  <Text className="text-white/70 text-sm font-cinzel text-center w-full">
                    Cargando progreso semanal...
                  </Text>
                )}
              </View>
            </View>

            {/* Additional test content */}
            <View className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 mt-6">
              <Text className="text-white font-medium font-cinzel mb-3">Motivación Diaria</Text>
              <Text className="text-white/80 text-sm font-cinzel leading-5">
                "Cada día que resistes es un día que tu mente se fortalece. Cada momento de control es una victoria sobre tus impulsos. Mantente firme en tu propósito y recuerda por qué comenzaste este camino."
              </Text>
            </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Modals */}
      <EmergencyModal visible={showEmergency} onClose={() => setShowEmergency(false)} />
      <RelapseModal visible={showRelapse} onClose={() => setShowRelapse(false)} onRelapseRecorded={refreshRelapsesData} />
      <OathModal visible={showOath} onClose={() => setShowOath(false)} />
    </ImageBackground>
  );
}
