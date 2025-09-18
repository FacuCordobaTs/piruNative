// Import habit images
const wake_up_early_image = require('../assets/images/wake_up_early.jpg');
const run_image = require('../assets/images/run.jpg');
const gym_workout_image = require('../assets/images/gym_workout.jpg');
const drink_water_image = require('../assets/images/drink_water.jpg');
const cold_shower_image = require('../assets/images/cold_shower.jpg');
const meditate_image = require('../assets/images/meditate.jpg');
const screentime_limit_image = require('../assets/images/screentime_limit.jpg');
const read_books_image = require('../assets/images/read_books.jpg');
const journaling_image = require('../assets/images/journaling.jpg');
const sit_up_image = require('../assets/images/sit_up.jpg');
const push_up_image = require('../assets/images/push_up.jpg');
const studying_image = require('../assets/images/studying.jpg');
const no_fap_image = require('../assets/images/no_fap.jpg');
const no_smoke_image = require('../assets/images/no_smoke.jpg');
const no_alcohol_image = require('../assets/images/no_alcohol.jpg');
const praying_image = require('../assets/images/praying.jpg');

export interface PredefinedHabit {
  id: string;
  name: string;
  categories: string[];
  icon: string;
  image: any;
  description: string;
  emoji: string;
  difficulty: string;
  experienceReward: number;
  reminderTime: string;
}

export const AVAILABLE_HABITS: PredefinedHabit[] = [
  { 
    id: 'wake_up_early', 
    name: 'Despertarse temprano', 
    categories: ['Discipline', 'Mental'], 
    icon: 'Sun', 
    image: wake_up_early_image,
    description: 'Despertarse temprano para aprovechar el día',
    emoji: '🌅',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '07:00'
  },
  { 
    id: 'run', 
    name: 'Correr', 
    categories: ['Physical', 'Discipline'], 
    icon: 'Zap', 
    image: run_image,
    description: 'Correr para mantener la condición física',
    emoji: '🏃',
    difficulty: 'Medio',
    experienceReward: 20,
    reminderTime: '06:30'
  },
  { 
    id: 'gym_workout', 
    name: 'Entrenar en el gimnasio', 
    categories: ['Physical', 'Discipline', 'Social'], 
    icon: 'Dumbbell', 
    image: gym_workout_image,
    description: 'Entrenar en el gimnasio regularmente',
    emoji: '💪',
    difficulty: 'Medio',
    experienceReward: 20,
    reminderTime: '18:00'
  },
  { 
    id: 'drink_water', 
    name: 'Beber suficiente agua', 
    categories: ['Physical'], 
    icon: 'Droplets', 
    image: drink_water_image,
    description: 'Beber suficiente agua durante el día',
    emoji: '💧',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '08:00'
  },
  { 
    id: 'cold_shower', 
    name: 'Ducha fría', 
    categories: ['Discipline'], 
    icon: 'Droplets', 
    image: cold_shower_image,
    description: 'Ducharse con agua fría para fortalecer la mente',
    emoji: '❄️',
    difficulty: 'Difícil',
    experienceReward: 30,
    reminderTime: '07:30'
  },
  { 
    id: 'meditate', 
    name: 'Meditar', 
    categories: ['Spiritual', 'Mental'], 
    icon: 'Heart', 
    image: meditate_image,
    description: 'Meditar para calmar la mente y encontrar paz',
    emoji: '🧘',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '08:30'
  },
  { 
    id: 'screentime_limit', 
    name: 'Limitar pantallas', 
    categories: ['Mental', 'Social'], 
    icon: 'Smartphone', 
    image: screentime_limit_image,
    description: 'Limitar el tiempo en pantallas y redes sociales',
    emoji: '📱',
    difficulty: 'Medio',
    experienceReward: 20,
    reminderTime: '21:00'
  },
  { 
    id: 'read_books', 
    name: 'Leer libros', 
    categories: ['Mental'], 
    icon: 'BookOpen', 
    image: read_books_image,
    description: 'Leer libros para expandir el conocimiento',
    emoji: '📚',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '20:00'
  },
  { 
    id: 'journaling', 
    name: 'Escribir diario', 
    categories: ['Mental', 'Spiritual'], 
    icon: 'PenTool', 
    image: journaling_image,
    description: 'Escribir un diario para reflexionar',
    emoji: '📝',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '21:30'
  },
  { 
    id: 'sit_up', 
    name: 'Hacer abdominales', 
    categories: ['Physical'], 
    icon: 'Dumbbell', 
    image: sit_up_image,
    description: 'Hacer abdominales para fortalecer el core',
    emoji: '💪',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '19:00'
  },
  { 
    id: 'push_up', 
    name: 'Hacer flexiones', 
    categories: ['Physical'], 
    icon: 'Dumbbell', 
    image: push_up_image,
    description: 'Hacer flexiones para fortalecer brazos y pecho',
    emoji: '💪',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '19:30'
  },
  { 
    id: 'studying', 
    name: 'Estudiar', 
    categories: ['Mental'], 
    icon: 'BookMarked', 
    image: studying_image,
    description: 'Estudiar para mejorar conocimientos y habilidades',
    emoji: '📖',
    difficulty: 'Medio',
    experienceReward: 20,
    reminderTime: '14:00'
  },
  { 
    id: 'no_fap', 
    name: 'No fap', 
    categories: ['Discipline', 'Spiritual', 'Social'], 
    icon: 'Shield', 
    image: no_fap_image,
    description: 'Abstinencia para fortalecer la voluntad',
    emoji: '🛡️',
    difficulty: 'Difícil',
    experienceReward: 30,
    reminderTime: '22:00'
  },
  { 
    id: 'no_smoke', 
    name: 'No fumar', 
    categories: ['Discipline', 'Spiritual'], 
    icon: 'Flame', 
    image: no_smoke_image,
    description: 'No fumar para cuidar la salud pulmonar',
    emoji: '🚭',
    difficulty: 'Difícil',
    experienceReward: 30,
    reminderTime: '09:00'
  },
  { 
    id: 'no_alcohol', 
    name: 'No beber alcohol', 
    categories: ['Discipline', 'Spiritual'], 
    icon: 'Wine', 
    image: no_alcohol_image,
    description: 'Evitar el alcohol para mantener la claridad mental',
    emoji: '🚫',
    difficulty: 'Medio',
    experienceReward: 20,
    reminderTime: '20:00'
  },
  { 
    id: 'praying', 
    name: 'Orar', 
    categories: ['Spiritual'], 
    icon: 'Cross', 
    image: praying_image,
    description: 'Orar para conectar con lo espiritual',
    emoji: '🙏',
    difficulty: 'Fácil',
    experienceReward: 10,
    reminderTime: '08:00'
  },
];

// Helper function to get habit by ID
export const getHabitById = (id: string): PredefinedHabit | undefined => {
  return AVAILABLE_HABITS.find(habit => habit.id === id);
};

// Helper function to map predefined habit to habit creation data
export const mapPredefinedToCreateData = (habit: PredefinedHabit) => {
  return {
    name: habit.name,
    description: habit.description,
    experienceReward: habit.experienceReward,
    reminderTime: habit.reminderTime,
    categories: [
      habit.categories.includes('Physical'),
      habit.categories.includes('Mental'),
      habit.categories.includes('Spiritual'),
      habit.categories.includes('Discipline'),
      habit.categories.includes('Social')
    ],
    targetDays: [true, true, true, true, true, true, true], // Default to all days
    predefinedId: habit.id,
    image: habit.image,
  };
};
