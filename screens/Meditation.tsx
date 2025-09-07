import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ImageBackground } from "react-native";
import { Pause, Play } from "lucide-react-native";
// Nueva pantalla de Meditación
export default function MeditationScreen({navigation}: any) {
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [isActive, setIsActive] = useState(false);
  
    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (isActive && timer > 0) {
        interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } else if (timer === 0) {
        setIsActive(false);
        // Logic for meditation complete, maybe show a modal or navigate back
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isActive, timer]);
  
    const toggleTimer = () => {
      setIsActive(!isActive);
    };
  
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
  
    return (
      <ImageBackground
        source={require("../assets/images/nofap-landscape3.jpg")}
        className="flex-1"
        imageStyle={{ resizeMode: "cover" }}
      >
        <View className="flex-1 bg-black/70 items-center justify-center p-4">
          <SafeAreaView className="flex-1 w-full items-center justify-center">
            <View className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 w-full items-center">
              <Text className="text-yellow-400 font-bold text-2xl mb-4">
                Meditación Guiada
              </Text>
              <Text className="text-white text-lg text-center mb-6">
                Enfócate en tu respiración, silencia tu mente y encuentra tu paz interior.
              </Text>
  
              <Text className="text-white text-6xl font-extrabold my-8">
                {formatTime(timer)}
              </Text>
  
              <TouchableOpacity
                onPress={toggleTimer}
                className="w-24 h-24 rounded-full bg-yellow-500 items-center justify-center"
              >
                {isActive ? (
                  <Pause color="black" size={36} />
                ) : (
                  <Play color="black" size={36} />
                )}
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mt-8 bg-white/20 rounded-xl py-3 px-6"
              >
                <Text className="text-white font-bold">Volver</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  };