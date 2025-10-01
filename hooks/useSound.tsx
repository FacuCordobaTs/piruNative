// hooks/useSound.ts
import { useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useSound = () => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Configurar audio al montar el componente
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };

    setupAudio();

    // Cleanup al desmontar
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSuccessSound = async () => {
    try {
      // Si ya hay un sonido cargado, lo descargamos primero
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Cargar y reproducir el sonido de éxito
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/complete_habit.mp3'), // Tu archivo de sonido
        { shouldPlay: true, volume: 0.5 }
      );

      soundRef.current = sound;

      // Opcional: liberar el sonido cuando termine
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  };

  const playLevelUpSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/level_up.mp3'), // Tu archivo de sonido
        { shouldPlay: true, volume: 0.7 }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (error) {
      console.error('Error playing level up sound:', error);
    }
  };

  const playButtonSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/button.mp3'), // Tu archivo de sonido
        { shouldPlay: true, volume: 0.3 }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (error) {
      console.error('Error playing button sound:', error);
    }
  };
  

  const playSelectOptionSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/select_option.mp3'), // Tu archivo de sonido
        { shouldPlay: true, volume: 0.3 }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (error) {
      console.error('Error playing select option sound:', error);
    }
  };

  return {
    playSuccessSound,
    playLevelUpSound,
    playButtonSound,
    playSelectOptionSound,
  };
};