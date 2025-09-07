import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, Image, ImageBackground, ScrollView, TouchableOpacity } from "react-native";
import { Flame, Zap, Trophy, Crown, Settings } from "lucide-react-native";
import Svg, { Path, Line, Circle  } from 'react-native-svg';
import { useUser } from "../../context/userProvider";

// Asegúrate de tener estas imágenes en tu carpeta de assets
const backgroundImage = require("../../assets/images/medieval-house-bg.jpg");
const piruNivel1 = require("../../assets/images/piru-transparent.png");
const piruNivel2  = require('../../assets/images/pirunivel2.png');
const piruNivel3  = require('../../assets/images/pirunivel3.png');
const piruNivel4  = require('../../assets/images/pirunivel4.png');


// Componente simulado de XPBar para React Native
const XPBar = ({ value, className = "" }: { value: number, className?: string }) => (
  <View className={`w-full h-3 rounded-full bg-gray-700 overflow-hidden ${className}`}>
    <View
      className="h-full bg-yellow-500 rounded-full"
      style={{ width: `${value}%` }}
    />
  </View>
);

interface PentagonStatsProps {
  stats: {
    fisico: number;
    mental: number;
    espiritual: number;
    disciplina: number;
    social: number;
  };
}

const PentagonStats = ({ stats }: PentagonStatsProps) => {
  const statLabels = [
    { key: "fisico", label: "FÍSICO", color: "#10B981" },
    { key: "social", label: "SOCIAL", color: "#10B981" },
    { key: "disciplina", label: "DISCIPLINA", color: "#10B981" },
    { key: "espiritual", label: "ESPIRITUAL", color: "#10B981" },
    { key: "mental", label: "MENTAL", color: "#10B981" },
  ];

  // Calculate pentagon points (5 points in a circle)
  const centerX = 120;
  const centerY = 120;
  const radius = 80;
  const maxRadius = 70;

  const getPoint = (index: number, value: number, maxValue = 100) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    const r = (value / maxValue) * maxRadius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const getOuterPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Create grid lines (concentric pentagons)
  const gridLevels = [20, 40, 60, 80, 100];

  // Create data polygon
  const dataPoints = statLabels.map((stat, index) =>
    getPoint(index, stats[stat.key as keyof typeof stats])
  );
  const dataPathData = `M${dataPoints.map((p) => `${p.x},${p.y}`).join("L")}Z`;


  return (
    <View className="p-6  mb-6">

      <View className="relative items-center">
        <Svg width="240" height="240">
          {/* Grid lines */}
          {gridLevels.map((level ) => {
            const gridPoints = Array.from({ length: 5 }, (_, i) => getPoint(i, level));
            const gridPath = `M${gridPoints.map((p) => `${p.x},${p.y}`).join("L")}Z`;
            return (
              <Path key={level} d={gridPath} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
            );
          })}

          {/* Axis lines */}
          {statLabels.map((_, index) => {
            const outerPoint = getOuterPoint(index);
            return (
              <Line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data area with gradient */}

          {/* Data polygon */}
          <Path
            d={dataPathData}
            fill="rgba(251, 191, 36, 0.1)"
            stroke="rgba(251, 191, 36, 0.8)"
            strokeWidth="2"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={statLabels[index].color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </Svg>

        {/* Labels positioned around the pentagon */}
        {statLabels.map((stat, index) => {
          const labelPoint = getOuterPoint(index);
          const isTop = index === 0;
          const isLeft = index === 3 || index === 4;
          const isRight = index === 1 || index === 2;

          return (
            <View
              key={stat.key}
              className="absolute items-center w-[80px]"
              style={{
                left: labelPoint.x - 10,
                top: labelPoint.y - (isTop ? 25 : 10),
              }}
            >
              <Text className="text-xs font-cinzel-bold text-center" style={{ color: 'white' }}>
                {stat.label}
              </Text>
              <Text className="text-white text-xs mt-1">{stats[stat.key as keyof typeof stats]}</Text>
            </View>
          );
        })}
      </View>

      {/* Stats breakdown */}
      <View className="flex-row justify-between mt-6">
        {statLabels.map((stat) => (
          <View key={stat.key} className="items-center">
            <View className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: stat.color }} />
            <Text className="text-xs text-white/70 capitalize">{stat.key}</Text>
            <Text className="text-sm font-bold text-white">{stats[stat.key as keyof typeof stats]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function ProfileScreen({navigation}: any) {
  const { user, currentStreak, getLeaderboard } = useUser();
  const xp = user?.experience || 0;
  // const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [levelLeaderboard, setLevelLeaderboard] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboard = await getLeaderboard();
      // setLeaderboard(leaderboard.nofapLeaderboard);
      setLevelLeaderboard(leaderboard.levelLeaderboard);
    };
    fetchLeaderboard();
  }, []);

  const getPiruNivelImage = () => {
    if (!user) return piruNivel1;
    
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
    <ImageBackground
      source={backgroundImage}
      className="flex-1"
      imageStyle={{ resizeMode: "cover" }}
    >
      <View className="flex-1 bg-black/70 pt-12">
        <SafeAreaView className="flex-1">
          {/* Header with Settings Button */}
          <View className="flex-row justify-between items-center p-4 pb-8">
            <View />
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Settings size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            className="px-4"
            contentContainerStyle={{ paddingBottom: 128 }}
            showsVerticalScrollIndicator={false}
          >
            
            <View className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 mb-6">
              <View className="flex-row items-center justify-center gap-3 mb-4">
                <View className="text-left">
                  <Text className="text-white font-cinzel-bold text-xl text-center">Tu Piru</Text>
                  <Text className="text-white/70 text-sm text-center font-cinzel">Nivel {user?.level}</Text>
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Image source={getPiruNivelImage()} style={{ width: 200, height: 200, objectFit: 'contain' }} />
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-4xl font-cinzel-bold text-white">
                  {
                    user?.lastRelapse ? Math.floor((new Date().getTime() - new Date(user.lastRelapse).getTime()) / (1000 * 60 * 60 * 24)) : 0
                  }
                </Text>
                <Text className="text-white/80 text-xl font-cinzel">días NoFap</Text>
              </View>
            </View>

            {/* Pentagon Stats */}
            <PentagonStats stats={{
              fisico: user?.physicalPoints || 0,
              mental: user?.mentalPoints || 0,
              espiritual: user?.spiritualPoints || 0,
              disciplina: user?.disciplinePoints || 0,
              social: user?.socialPoints || 0
            }} />
            {/* Hero Profile Section */}

            {/* Level Progress */}
            <View className=" p-4  mb-6">
              <View className="flex-row items-center gap-3">
                <Trophy className="w-6 h-6" color={'white'}/>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-cinzel-bold text-white">Nivel {user?.level}</Text>
                    <Text className="text-xs font-cinzel-bold text-white">
                      {xp}/{user?.experienceToNext} XP
                    </Text>
                  </View>
                  <XPBar value={(xp / (user?.experienceToNext || 100)) * 100} />
                </View>
              </View>
            </View>

            {/* Leaderboard */}
            <View className="p-4 b mb-6">
              <View className="flex-row items-center gap-2 mb-4">
                <Crown className="w-5 h-5" color={'white'}/>
                <Text className="font-cinzel-bold text-white text-lg">Ranking Semanal</Text>
              </View>
              <View className="space-y-3">
                {levelLeaderboard.map((m) => (
                  <View
                    key={m.id}
                    className={`flex-row items-center justify-between my-2 p-3 rounded-lg ${
                      m.isCurrentUser ? "bg-yellow-400/10 border border-yellow-400/30" : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                        <Text className="font-cinzel-bold text-lg text-white px-2">{m.rank}</Text>
                        <Text className="text-xl">{m.avatar || "👤"}</Text>
                      <View>
                        <View className="flex-row items-center">
                          <Text className="font-cinzel-bold text-white">{m.name || "Anónimo"}</Text>
                          {m.isCurrentUser && <Text className="text-yellow-400 text-sm ml-1">(Tú)</Text>}
                        </View>
                        <View className="flex-row items-center gap-3 mt-1">
                          <View className="flex-row items-center gap-1">
                            <Zap className="w-3 h-3" color={'white'}/>
                            <Text className="text-xs font-cinzel-bold text-white">Nivel {m.level}</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Flame className="w-3 h-3" color={'white'}/>
                            <Text className="text-xs font-cinzel-bold text-white">{m.longestStreak || 0} d</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="text-right">
                      <Text className="text-yellow-400 font-cinzel-bold">+{m.weeklyXP} XP</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View> 
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
