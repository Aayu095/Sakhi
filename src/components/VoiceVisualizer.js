import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../config/theme';

const BAR_COUNT = 12;

export default function VoiceVisualizer({
  isActive = false,
  intensity = 0.5,
  color = COLORS.primary[400],
}) {
  const animatedValues = useRef(
    [...Array(BAR_COUNT)].map(() => new Animated.Value(0.15))
  ).current;

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      stopAnimation();
    }
    return () => {
      animatedValues.forEach((v) => v.stopAnimation());
    };
  }, [isActive, intensity]);

  const startAnimation = () => {
    const animations = animatedValues.map((animatedValue, index) => {
      // Create a mirrored wave pattern: center bars are taller
      const centerDistance = Math.abs(index - (BAR_COUNT - 1) / 2);
      const multiplier = 1 - centerDistance / (BAR_COUNT / 2);
      const peakValue = 0.4 + multiplier * 0.6 * Math.max(0.3, intensity);

      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: peakValue,
            duration: 200 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.12 + Math.random() * 0.1,
            duration: 200 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.stagger(40, animations).start();
  };

  const stopAnimation = () => {
    animatedValues.forEach((animatedValue) => {
      animatedValue.stopAnimation();
      Animated.timing(animatedValue, {
        toValue: 0.15,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 80],
              }),
              backgroundColor: isActive ? color : 'rgba(255,255,255,0.2)',
              opacity: isActive ? 0.9 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: 3,
    paddingHorizontal: 16,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    minHeight: 8,
  },
});
