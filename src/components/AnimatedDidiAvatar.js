import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Easing } from 'react-native';
import { COLORS } from '../config/theme';

// Professional Didi avatar illustrations
const DIDI_AVATAR = require('../../assets/images/didi_avatar.png');
const DIDI_AVATAR_CIRCLE = require('../../assets/images/didi_avatar_circle.png');

export default function AnimatedDidiAvatar({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  emotion = 'neutral',
  size = 120,
  variant = 'default', // 'default' (full figure) or 'circle' (portrait)
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Gentle pulse when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  // Glow effect when speaking
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false, // color interpolation doesn't support native driver
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isSpeaking]);

  // Rotation effect when thinking
  useEffect(() => {
    if (isThinking) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [isThinking]);

  // Small bounce on emotion change
  useEffect(() => {
    if (emotion !== 'neutral') {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -6,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [emotion]);

  const getBorderColor = () => {
    if (isListening) return COLORS.status.success;
    if (isSpeaking) return COLORS.primary[500];
    if (isThinking) return COLORS.status.warning; // Orange for thinking
    return COLORS.primary[300];
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ALWAYS use the full avatar (user request: "use only one avatar... on every place")
  const avatarSource = DIDI_AVATAR;

  return (
    <View style={[styles.container, { width: size + 16, height: size + 16 }]}>
      {/* Glow ring when speaking */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            borderColor: COLORS.primary[400],
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Thinking ring (rotating dash) */}
      {isThinking && (
        <Animated.View
          style={[
            styles.thinkingRing,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: (size + 12) / 2,
              borderColor: COLORS.status.warning,
              transform: [{ rotate: spin }],
            },
          ]}
        />
      )}

      {/* Main avatar */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: getBorderColor(),
            transform: [
              { scale: pulseAnim },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        <Image
          source={avatarSource}
          style={[
            styles.avatarImage,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
            },
          ]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Status indicator dots */}
      {(isListening || isThinking) && (
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isThinking ? COLORS.status.warning : COLORS.status.success }
          ]} />
          <View style={[
            styles.statusDot,
            {
              backgroundColor: isThinking ? COLORS.status.warning : COLORS.status.success,
              opacity: 0.7
            }
          ]} />
          <View style={[
            styles.statusDot,
            {
              backgroundColor: isThinking ? COLORS.status.warning : COLORS.status.success,
              opacity: 0.4
            }
          ]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 4,
  },
  thinkingRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  avatarContainer: {
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: COLORS.background.surface,
    elevation: 8,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    backgroundColor: '#FAFAFA',
  },
  statusIndicator: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
