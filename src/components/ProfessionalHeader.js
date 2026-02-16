import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/theme';

const DIDI_AVATAR = require('../../assets/images/didi_avatar_circle.png');

export default function ProfessionalHeader() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        {/* Brand Icon */}
        <Image
          source={DIDI_AVATAR}
          style={styles.brandIcon}
          resizeMode="cover"
        />

        {/* Brand Name */}
        <View style={styles.brandText}>
          <Text style={styles.logoText}>सखी</Text>
          <Text style={styles.taglineText}>Sakhi</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  brandText: {
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  taglineText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
    marginTop: -2,
  },
});