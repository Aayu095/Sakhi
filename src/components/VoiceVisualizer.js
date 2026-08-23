import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../config/theme';

const BAR_COUNT = 11;

/**
 * A calm, bounded audio-level indicator. The parent supplies microphone
 * metering while listening and a gentle speech level while Sakhi is talking.
 */
export default function VoiceVisualizer({
  isActive = false,
  intensity = 0.5,
  color = COLORS.primary[400],
}) {
  const animatedValues = useRef(
    [...Array(BAR_COUNT)].map(() => new Animated.Value(0.12))
  ).current;

  useEffect(() => {
    const normalizedIntensity = Math.max(0.12, Math.min(1, intensity));
    const animations = animatedValues.map((animatedValue, index) => {
      const centerDistance = Math.abs(index - (BAR_COUNT - 1) / 2);
      const centerWeight = 1 - centerDistance / ((BAR_COUNT + 1) / 2);
      const target = isActive
        ? Math.max(0.16, normalizedIntensity * (0.42 + centerWeight * 0.58))
        : 0.12;

      return Animated.timing(animatedValue, {
        toValue: target,
        duration: isActive ? 140 : 180,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [animatedValues, intensity, isActive]);

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
                outputRange: [6, 46],
              }),
              backgroundColor: isActive ? color : 'rgba(255,255,255,0.22)',
              opacity: isActive ? 0.92 : 0.42,
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
    height: 54,
    gap: 4,
    paddingHorizontal: 14,
  },
  bar: {
    width: 4,
    borderRadius: 4,
    minHeight: 6,
  },
});
