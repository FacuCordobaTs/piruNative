import React, { useRef } from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';
import { useSound } from '../hooks/useSound';

interface IronAnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  style?: any;
  disabled?: boolean;
}

export function IronAnimatedButton({ 
  onPress, 
  children, 
  className = "mb-6 w-full",
  style = {},
  disabled = false 
}: IronAnimatedButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { playButtonSound } = useSound();
  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
    playButtonSound();
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  return (
    <Animated.View
      className={className}
      style={{
        paddingVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
        ...style,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View style={{
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
          transform: [{ scale: scaleValue }],
          opacity: disabled ? 0.6 : 1,
        }}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}
