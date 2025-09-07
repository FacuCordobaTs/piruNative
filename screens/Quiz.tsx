import React, { useState, useRef  } from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T } from '../components/T';
import { useUser } from '../context/userProvider';

// Importa tus imágenes desde la ruta correcta
const backgroundImage = require('../assets/images/landscape-quiz.jpg');
const logoImage = require('../assets/images/piru-logo-transparente.webp');

interface FormData {
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


const ages = [
  { id: 12, label: "12 o menor", icon: "" },
  { id: 16, label: "13 a 16", icon: "" },
  { id: 24, label: "17 a 24", icon: "" },
  { id: 25, label: "25 o mayor", icon: "" },
];

const goals = [
    { id: "nofap", label: "Dejar el fap", icon: "🛡️" },
    { id: "training", label: "Ser constante entrenando", icon: "💪" },
    { id: "energy", label: "Aumentar mi energía", icon: "⚡" },
    { id: "sleep", label: "Mejorar mi sueño", icon: "🌙" },
    { id: "focus", label: "Tener mejor enfoque", icon: "🎯" },
];

// Sub-preguntas para "Dejar el fap"
const nofapFrequency = [
    { id: "never", label: "Nunca" },
    { id: "daily", label: "A diario" },
    { id: "weekly", label: "Algunas veces en la semana" },
    { id: "monthly", label: "Algunas veces en el mes" },
];
const yesNoOptions = [{ id: "yes", label: "Sí" }, { id: "no", label: "No" }];
const relapseCauses = [
    { id: "boredom", label: "Aburrimiento" },
    { id: "stress", label: "Estrés" },
    { id: "trigger", label: "Gatillo (contenido)" },
    { id: "loneliness", label: "Soledad" },
    { id: "curiosity", label: "Curiosidad" },
];

// Sub-preguntas para "Entrenamiento"
const sports = [
    { id: "soccer", label: "Fútbol", icon: "⚽" },
    { id: "basketball", label: "Baloncesto", icon: "🏀" },
    { id: "gym", label: "Gimnasio", icon: "💪" },
    { id: "other", label: "Otro", icon: "✨" },
    { id: "none", label: "Ninguno", icon: "🤷" },
];
const trainingFrequency = [
    { id: "0-2", label: "0-2 veces por semana" },
    { id: "3-5", label: "3-5 veces por semana" },
    { id: "6+", label: "6 o más veces por semana" },
];
const trainingCauses = [
    { id: "motivation", label: "Falta de motivación" },
    { id: "time", label: "Falta de tiempo" },
    { id: "knowledge", label: "No sé qué hacer" },
    { id: "fatigue", label: "Me canso rápido" },
    { id: "results", label: "No veo resultados" },
];

// Sub-preguntas para "Sueño"
const sleepHours = [
    { id: "<7", label: "7 horas o menos" },
    { id: "7-9", label: "Entre 7 y 9 horas" },
    { id: ">9", label: "9 horas o más" },
];
const tiredOnWake = [
    { id: "always", label: "Siempre" },
    { id: "normally", label: "Normalmente" },
    { id: "sometimes", label: "Algunas veces" },
    { id: "never", label: "Nunca" },
];

// Sub-preguntas para "Energía"
const tiredTime = [
    { id: "morning", label: "Por la mañana" },
    { id: "after_lunch", label: "Después de almorzar" },
    { id: "afternoon", label: "Por la tarde/noche" },
    { id: "all_day", label: "Todo el día" },
];
const energyLevels = [
    { id: "1", label: "Muy baja" }, { id: "2", label: "Baja" },
    { id: "3", label: "Normal" }, { id: "4", label: "Alta" },
    { id: "5", label: "Muy alta" }
];

// Sub-preguntas para "Enfoque"
const distractionLevels = [
    { id: "easy", label: "Muy fácilmente" },
    { id: "sometimes", label: "A veces" },
    { id: "rarely", label: "Raramente" },
];
const focusSituations = [
    { id: "studies", label: "Estudios" },
    { id: "work", label: "Trabajo" },
    { id: "reading", label: "Lectura" },
    { id: "meditation", label: "Meditación/Reflexión" },
];

// Preguntas generales
const wakeUpTimes = [
    { id: "7", label: "7:00 AM o antes" },
    { id: "8", label: "8:00 AM" },
    { id: "9", label: "9:00 AM o después" },
    { id: "other", label: "Otro" },
];

const areas = [
  { id: "physical", label: "Físico", icon: "💪" },
  { id: "intellect", label: "Intelecto", icon: "🧠" },
  { id: "psyche", label: "Psique", icon: "🧘" },
  { id: "spiritual", label: "Espiritual", icon: "✨" },
  { id: "core", label: "Autoestima/Núcleo", icon: "🔥" },
];

// Nuevo componente para el efecto de glassmorphism con estilos simplificados
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
        blurRadius={30}
      />
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
};

// Componente IronButton con estilo medieval
const IronButton = ({ onPress, disabled, children, style }: { onPress: () => void, disabled?: boolean, children: React.ReactNode, style?: any }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.9}
    style={[styles.ironButton, disabled ? styles.ironButtonDisabled : {}, style]}
  >
    <View
      style={styles.ironButtonGradient}
    >
        <View style={styles.ironButtonBorder}>
         <T className="text-white font-cinzel text-base text-center">
           {children}
         </T>
       </View>
    </View>
  </TouchableOpacity>
);

// Componente GoldButton con estilo medieval
const GoldButton = ({ onPress, disabled, children, style }: { onPress: () => void, disabled?: boolean, children: React.ReactNode, style?: any }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    disabled={disabled}
    style={[styles.goldButton, disabled ? styles.goldButtonDisabled : {}, style]}
  >
    <View
      style={styles.goldButtonGradient}
    >
             <View style={styles.goldButtonBorder}>
         <T className="text-black font-cinzel-bold text-base text-center">
           {children}
         </T>
       </View>
    </View>
  </TouchableOpacity>
);

const OptionButton = ({ onPress, active, icon, label }: { onPress: () => void, active: boolean, icon?: string, label: string }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.optionButtonWrapper}>
    <View style={[styles.optionButtonBase, active ? styles.optionButtonActive : {}]}>
      {icon && <T style={styles.optionIcon}>{icon}</T>}
      <T style={styles.optionLabel}>{label}</T>
    </View>
  </TouchableOpacity>
);

export default function QuizPage({navigation}: any) {
  const { completeQuiz } = useUser();
  
  // Estado para el paso actual del quiz
  const [step, setStep] = useState('name');
  // Historial para el botón "Atrás"
  const [history, setHistory] = useState<string[]>([]);
  // Estado para todos los datos del formulario
  const [form, setForm] = useState<FormData>({
    name: "",
    age: null,
    goals: [],
    wakeUpTime: "",
    focusArea: "",
  });

  // --- LÓGICA DE NAVEGACIÓN Y PROGRESO ---

  // Define el orden de las preguntas principales
  const mainFlow = ['name', 'age', 'goals'];
  // Define el orden de las preguntas condicionales según el objetivo
  const goalFlows: { [key: string]: string[] } = {
    nofap: ['nofap_frequency', 'nofap_frequency_increased', 'nofap_explicit_content', 'nofap_relapse_causes', 'nofap_message'],
    training: ['training_current_sport', 'training_frequency', 'training_consistency_cause', 'training_message'],
    sleep: ['sleep_hours', 'sleep_tired_on_wake', 'sleep_message'],
    energy: ['energy_tired_time', 'energy_level', 'energy_message'],
    focus: ['focus_distraction_level', 'focus_situations', 'focus_message'],
  };
  const finalFlow = ['wakeUpTime', 'pentagon', 'commitment'];

  // Calcula el progreso de la barra
  const calculateProgress = () => {
      const allGoalQuestions = form.goals.flatMap(goal => goalFlows[goal] || []);
      const totalSteps = [...mainFlow, ...allGoalQuestions, ...finalFlow];
      const currentIndex = totalSteps.indexOf(step);
      if (currentIndex === -1) return 0;
      return Math.round(((currentIndex + 1) / totalSteps.length) * 100);
  };
  const progress = calculateProgress();

  // Valida si se puede avanzar al siguiente paso
  const canNext = () => {
    switch (step) {
      case 'name': return form.name.trim().length > 2;
      case 'age': return form.age !== null;
      case 'goals': return form.goals.length >= 2;
      case 'nofap_frequency': return !!form.nofap_frequency;
      case 'nofap_frequency_increased': return !!form.nofap_frequency_increased;
      case 'nofap_explicit_content': return !!form.nofap_explicit_content;
      case 'nofap_relapse_causes': return !!form.nofap_relapse_causes && form.nofap_relapse_causes.length > 0;
      case 'training_current_sport': return !!form.training_current_sport;
      case 'training_frequency': return !!form.training_frequency;
      case 'training_consistency_cause': return !!form.training_consistency_cause;
      case 'sleep_hours': return !!form.sleep_hours;
      case 'sleep_tired_on_wake': return !!form.sleep_tired_on_wake;
      case 'energy_tired_time': return !!form.energy_tired_time;
      case 'energy_level': return !!form.energy_level;
      case 'focus_distraction_level': return !!form.focus_distraction_level;
      case 'focus_situations': return !!form.focus_situations && form.focus_situations.length > 0;
      case 'wakeUpTime': return !!form.wakeUpTime;
      case 'pentagon': return !!form.focusArea;
      case 'commitment': return true; // Siempre se puede avanzar desde la firma
      default: return true; // Para los mensajes intermedios
    }
  };

  // Maneja el avance al siguiente paso
  const handleNext = () => {
    if (!canNext()) return;

    setHistory([...history, step]);

    // Flujo principal (name -> age -> goals)
    if (step === 'name') {
        setStep('age');
        return;
    }
    if (step === 'age') {
        setStep('goals');
        return;
    }
    if (step === 'goals') {
        // Después de seleccionar objetivos, ir al primer objetivo
        if (form.goals.length > 0) {
            const firstGoal = form.goals[0];
            setStep(goalFlows[firstGoal][0]);
            return;
        }
    }

    // Determinar en qué flujo de objetivo estamos
    let currentGoal = '';
    let currentGoalIndex = -1;
    
    for (let i = 0; i < form.goals.length; i++) {
        const goal = form.goals[i];
        const flow = goalFlows[goal];
        if (flow && flow.includes(step)) {
            currentGoal = goal;
            currentGoalIndex = i;
            break;
        }
    }

    if (currentGoal) {
        const currentFlow = goalFlows[currentGoal];
        const currentStepIndex = currentFlow.indexOf(step);
        
        // Si hay más pasos en el flujo actual
        if (currentStepIndex < currentFlow.length - 1) {
            setStep(currentFlow[currentStepIndex + 1]);
            return;
        }
        
        // Si terminó el flujo actual, ir al siguiente objetivo
        const nextGoalIndex = currentGoalIndex + 1;
        if (nextGoalIndex < form.goals.length) {
            const nextGoal = form.goals[nextGoalIndex];
            setStep(goalFlows[nextGoal][0]);
            return;
        }
        
        // Si terminó todos los objetivos, ir al flujo final
        setStep('wakeUpTime');
        return;
    }

    // Flujo final (wakeUpTime -> pentagon -> commitment)
    if (step === 'wakeUpTime') {
        setStep('pentagon');
        return;
    }
    if (step === 'pentagon') {
        setStep('commitment');
        return;
    }
  };
  
  // Maneja el retroceso al paso anterior
  const handleBack = () => {
    const lastStep = history[history.length - 1];
    if (lastStep) {
      setStep(lastStep);
      setHistory(history.slice(0, -1));
    }
  };
  
  // Completa el quiz y navega a la siguiente pantalla
  const handleComplete = () => {
    if (!canNext()) return;
    // Save all form data to AsyncStorage for profile screen
    const saveQuizData = async () => {
      try {
        await AsyncStorage.setItem('quizData', JSON.stringify(form));
      } catch (error) {
        console.error('Error saving quiz data:', error);
      }
    };
    saveQuizData();
    completeQuiz({ name: form.name, age: Number(form.age) }); // Pasa los datos necesarios
    navigation.navigate('Loading');
  };

  // --- RENDERIZADO DE PREGUNTAS ---

  const renderQuestion = () => {
    switch (step) {
      case 'name':
        return (
          <View>
            <T className="font-cinzel-bold text-white mb-4 text-xl">¿Cuál es tu nombre o apodo?</T>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Alex, DragonSlayer..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
          </View>
        );
      case 'age':
        return (
          <View>
            <T className="font-cinzel-bold text-white mb-4 text-xl">¿Cuántos años tienes?</T>
            <View style={styles.optionsContainer}>
              {ages.map((a) => (
                <OptionButton key={a.id} icon={a.icon} label={a.label} active={form.age === a.id} onPress={() => setForm({ ...form, age: a.id })} />
              ))}
            </View>
          </View>
        );
      case 'goals':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Qué quieres lograr con Piru?</T>
                <T className="text-white/80 mb-4 text-base">Selecciona al menos 2 objetivos.</T>
                <View style={styles.optionsContainer}>
                {goals.map((g) => (
                    <OptionButton
                    key={g.id}
                    icon={g.icon}
                    label={g.label}
                    active={form.goals.includes(g.id)}
                    onPress={() =>
                        setForm((prev) => ({
                        ...prev,
                        goals: prev.goals.includes(g.id)
                            ? prev.goals.filter((x) => x !== g.id)
                            : [...prev.goals, g.id],
                        }))
                    }
                    />
                ))}
                </View>
            </View>
        );
      // --- Flujo NoFap ---
      case 'nofap_frequency':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Con qué frecuencia consumes pornografía?</T>
                <View style={styles.optionsContainer}>
                    {nofapFrequency.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.nofap_frequency === o.id} onPress={() => setForm({ ...form, nofap_frequency: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'nofap_frequency_increased':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Tu frecuencia de consumo aumentó con el tiempo?</T>
                <View style={styles.optionsContainer}>
                    {yesNoOptions.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.nofap_frequency_increased === o.id} onPress={() => setForm({ ...form, nofap_frequency_increased: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'nofap_explicit_content':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Te sientes atraído a ver contenido cada vez más explícito?</T>
                <View style={styles.optionsContainer}>
                    {yesNoOptions.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.nofap_explicit_content === o.id} onPress={() => setForm({ ...form, nofap_explicit_content: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'nofap_relapse_causes':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Cuáles crees que son las causas principales de tus recaídas?</T>
                <View style={styles.optionsContainer}>
                    {relapseCauses.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.nofap_relapse_causes?.includes(o.id) || false} onPress={() => setForm(prev => ({...prev, nofap_relapse_causes: prev.nofap_relapse_causes?.includes(o.id) ? prev.nofap_relapse_causes.filter(i => i !== o.id) : [...(prev.nofap_relapse_causes || []), o.id]}))} />
                    ))}
                </View>
            </View>
        );
      case 'nofap_message':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl text-center">¡Estás en el lugar correcto!</T>
                <Image source={require('../assets/images/piru-meditando-transparente.png')} style={{ width: 200, height: 250, alignSelf: 'center', objectFit: 'contain' }} />
                <T className="text-white/90 text-base text-center">Piru te proporcionará las herramientas y el apoyo para superar esta adicción y forjar una voluntad de hierro.</T>
            </View>
        );
      // --- Flujo Entrenamiento ---
      case 'training_current_sport':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Actualmente ya haces algún deporte?</T>
                <View style={styles.optionsContainer}>
                    {sports.map((o) => (
                        <OptionButton key={o.id} icon={o.icon} label={o.label} active={form.training_current_sport === o.id} onPress={() => setForm({ ...form, training_current_sport: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'training_frequency':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Cuántas veces a la semana {form.training_current_sport === 'none' ? 'te gustaría hacer' : 'haces'} ejercicio?</T>
                <View style={styles.optionsContainer}>
                    {trainingFrequency.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.training_frequency === o.id} onPress={() => setForm({ ...form, training_frequency: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'training_consistency_cause':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿Cuál es la causa principal por la que no eres constante?</T>
                <View style={styles.optionsContainer}>
                    {trainingCauses.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.training_consistency_cause === o.id} onPress={() => setForm({ ...form, training_consistency_cause: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'training_message':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl text-center">¡La disciplina es tu mejor arma!</T>
                <Image source={require('../assets/images/piru-ejercicio-transparente.png')} style={{ width: 200, height: 250, alignSelf: 'center', objectFit: 'contain' }} />
                <T className="text-white text-base text-center">Piru te motivará a no faltar a ningún entrenamiento y a convertir el ejercicio en un pilar de tu vida.</T>
            </View>
        );
      // --- Flujo Sueño ---
      case 'sleep_hours':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl">¿Cuántas horas duermes al día?</T>
                  <View style={styles.optionsContainer}>
                      {sleepHours.map((o) => (
                          <OptionButton key={o.id} label={o.label} active={form.sleep_hours === o.id} onPress={() => setForm({ ...form, sleep_hours: o.id })} />
                      ))}
                  </View>
              </View>
          );
      case 'sleep_tired_on_wake':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl">Cuando te despiertas, ¿te sientes cansado?</T>
                  <View style={styles.optionsContainer}>
                      {tiredOnWake.map((o) => (
                          <OptionButton key={o.id} label={o.label} active={form.sleep_tired_on_wake === o.id} onPress={() => setForm({ ...form, sleep_tired_on_wake: o.id })} />
                      ))}
                  </View>
              </View>
          );
      case 'sleep_message':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl text-center">Un buen descanso forja campeones</T>
                  <Image source={require('../assets/images/piru-durmiendo-transparente.png')} style={{ width: 200, height: 250, alignSelf: 'center', objectFit: 'contain' }} />
                  <T className="text-white/90 text-base text-center">Piru te ayudará a optimizar tu sueño para que cada día te levantes con la máxima energía.</T>
              </View>
          );
      // --- Flujo Energía ---
      case 'energy_tired_time':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl">¿En qué momento del día sientes más cansancio?</T>
                  <View style={styles.optionsContainer}>
                      {tiredTime.map((o) => (
                          <OptionButton key={o.id} label={o.label} active={form.energy_tired_time === o.id} onPress={() => setForm({ ...form, energy_tired_time: o.id })} />
                      ))}
                  </View>
              </View>
          );
      case 'energy_level':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl">En una escala del 1 al 5, ¿cómo calificarías tu energía actual?</T>
                  <View style={styles.optionsContainer}>
                      {energyLevels.map((o) => (
                          <OptionButton key={o.id} label={o.label} active={form.energy_level === o.id} onPress={() => setForm({ ...form, energy_level: o.id })} />
                      ))}
                  </View>
              </View>
          );
      case 'energy_message':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl text-center">¡Desata todo tu potencial!</T>
                  <Image source={require('../assets/images/piru-energia-transparente.png')} style={{ width: 200, height: 250, alignSelf: 'center', objectFit: 'contain' }} />
                  <T className="text-white/90 text-base text-center">Con Piru, construirás hábitos que llenarán tus días de vitalidad y energía inagotable.</T>
              </View>
          );
      // --- Flujo Enfoque ---
      case 'focus_distraction_level':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl">¿Con qué facilidad te distraes?</T>
                  <View style={styles.optionsContainer}>
                      {distractionLevels.map((o) => (
                          <OptionButton key={o.id} label={o.label} active={form.focus_distraction_level === o.id} onPress={() => setForm({ ...form, focus_distraction_level: o.id })} />
                      ))}
                  </View>
              </View>
          );
      case 'focus_situations':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl">¿En qué situaciones necesitas mejorar tu enfoque?</T>
                  <View style={styles.optionsContainer}>
                      {focusSituations.map((o) => (
                          <OptionButton key={o.id} label={o.label} active={form.focus_situations?.includes(o.id) || false} onPress={() => setForm(prev => ({...prev, focus_situations: prev.focus_situations?.includes(o.id) ? prev.focus_situations.filter(i => i !== o.id) : [...(prev.focus_situations || []), o.id]}))} />
                      ))}
                  </View>
              </View>
          );
      case 'focus_message':
          return (
              <View>
                  <T className="font-cinzel-bold text-white mb-4 text-xl text-center">Una mente enfocada es invencible</T>
                  <Image source={require('../assets/images/piru-estudiando-transparente.png')} style={{ width: 200, height: 250, alignSelf: 'center', objectFit: 'contain' }} />
                  <T className="text-white/90 text-base text-center">Piru te guiará para entrenar tu mente, eliminar distracciones y alcanzar un estado de concentración profunda.</T>
              </View>
          );
      // --- Flujo Final ---
      case 'wakeUpTime':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿A qué hora despiertas usualmente?</T>
                <View style={styles.optionsContainer}>
                    {wakeUpTimes.map((o) => (
                        <OptionButton key={o.id} label={o.label} active={form.wakeUpTime === o.id} onPress={() => setForm({ ...form, wakeUpTime: o.id })} />
                    ))}
                </View>
            </View>
        );
      case 'pentagon':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl">¿En qué área quieres mejorar más?</T>
                <View style={styles.optionsContainer}>
                    {areas.map((a) => (
                        <OptionButton key={a.id} icon={a.icon} label={a.label} active={form.focusArea === a.id} onPress={() => setForm({ ...form, focusArea: a.id })} />
                    ))}
                </View>
            </View>
        );
      case 'commitment':
        return (
            <View>
                <T className="font-cinzel-bold text-white mb-4 text-xl text-center">Firma tu Compromiso</T>
                <T className="text-white/90 text-base text-center mb-4">
                    Yo, <T className="font-cinzel-bold text-white">{form.name}</T>, me comprometo a usar Piru para forjar mi disciplina, superar mis límites y convertirme en la mejor versión de mí mismo.
                </T>
                <T className="text-white/90 text-base text-center">Acepto el desafío.</T>
            </View>
        );
      default:
        return <T>Cargando...</T>;
    }
  };

  return (
    <View style={styles.flex1}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>

            {/* Card para el encabezado */}
            <BlurredCard style={styles.headerCard}>
              <View style={styles.headerCardContent}>
                <Image
                  source={logoImage}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <View>
                  <T className="text-xs uppercase tracking-widest text-white/80">piru</T>
                  <T className="text-lg font-cinzel-bold text-white">Setup rápido</T>
                </View>
              </View>
            </BlurredCard>

            {/* Placa de progreso */}
            <View style={styles.plaque}>
              <T className="text-center text-white font-cinzel-black text-base tracking-widest">QUIZ {progress}%</T>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: `${progress}%` }]}
              />
            </View>

            {/* Card principal para las preguntas */}
            <BlurredCard style={styles.mainCard}>
              {renderQuestion()}
            </BlurredCard>

            {/* Controles de navegación */}
            <View style={styles.controlsContainer}>
              <IronButton onPress={handleBack} disabled={history.length === 0}>
                Atrás
              </IronButton>

              <GoldButton
                onPress={() => {
                  if (step === 'commitment') {
                    handleComplete();
                  } else {
                    handleNext();
                  }
                }}
                disabled={!canNext()}
              >
                {step === 'commitment' ? '¡Comenzar!' : 'Siguiente'}
              </GoldButton>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  backgroundImage: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  safeArea: { flex: 1, zIndex: 10 },
  scrollViewContent: { flexGrow: 1, padding: 16, width: '100%', alignSelf: 'center' },
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
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    marginTop: 20,
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: { width: 40, height: 40, marginRight: 12 },
  headerSubtitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255, 255, 255, 0.8)' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  plaque: {
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(218, 165, 32, 0.6)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  plaqueText: { textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1.5 },
  progressContainer: {
    height: 12,
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: { height: '100%', borderRadius: 9999 },
  mainCard: {
    width: '100%',
  },
  questionText: { fontWeight: 'bold', color: 'white', marginBottom: 16, fontSize: 20 },
  textInput: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    fontSize: 16,
  },
  optionsContainer: { gap: 12 },
  optionButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButtonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(0,0,0, 0.4)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  optionIcon: { fontSize: 22, marginRight: 16, color: 'white', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  optionLabel: { color: 'white', fontSize: 16, fontWeight: '500', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  controlsContainer: { flexDirection: 'row', gap: 16, marginTop: 16 },
  ironButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ironButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  
  ironButtonDisabled: {
    opacity: 1,
  },
  goldButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  goldButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldButtonBorder: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  },
  
  goldButtonDisabled: {
    opacity: 1,
  },
});
