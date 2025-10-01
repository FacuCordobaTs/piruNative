import React, { useRef } from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';
import { useSound } from '../hooks/useSound';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  style?: any;
  disabled?: boolean;
}

export function AnimatedButton({ 
  onPress, 
  children, 
  className = "mt-6 w-full",
  style = {},
  disabled = false 
}: AnimatedButtonProps) {
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
          transform: [{ scale: scaleValue }],
          opacity: disabled ? 0.6 : 1,
        }}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}
