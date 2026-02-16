import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

const { width, height } = Dimensions.get('window');

export default function UpdatedHeaderMenu({ navigation }) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { profile, signOut } = useAuth();

  // Removed 'progress' and 'community' options as requested
  const menuItems = [
    {
      id: 'profile',
      title: 'मेरी प्रोफाइल',
      subtitle: 'Profile & Settings',
      icon: 'account',
      screen: 'Settings',
      color: COLORS.primary[500],
    },
    {
      id: 'help',
      title: 'मदद कॉर्नर',
      subtitle: 'Help & Support',
      icon: 'help-circle',
      screen: 'HelpCorner',
      color: COLORS.status.info,
    },
  ];

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMenuVisible(true);
  };

  const handleMenuItemPress = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMenuVisible(false);

    setTimeout(() => {
      navigation.navigate(item.screen);
    }, 250);
  };

  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsMenuVisible(false);

    setTimeout(() => {
      signOut();
    }, 250);
  };

  // Get user's first name or first character for avatar
  const getUserDisplayName = () => {
    if (profile?.name) {
      return profile.name.split(' ')[0];
    }
    return 'सखी';
  };

  const getUserInitial = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    return 'द';
  };

  return (
    <>
      {/* Header Menu Button */}
      <Pressable onPress={handleMenuPress} style={styles.menuButton}>
        <MaterialCommunityIcons name="account-circle" size={32} color="#FFFFFF" />
      </Pressable>

      {/* Slide-out Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setIsMenuVisible(false)}
          />

          <View style={styles.menuPanel}>
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {getUserInitial()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    नमस्ते, {getUserDisplayName()}!
                  </Text>
                  <Text style={styles.userSubtitle}>
                    सीखने की यात्रा में आगे बढ़ें
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setIsMenuVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <View key={item.id}>
                  <Pressable
                    onPress={() => handleMenuItemPress(item)}
                    style={styles.menuItem}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                      <MaterialCommunityIcons name={item.icon} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {/* Menu Footer */}
            <View style={styles.menuFooter}>
              <Pressable onPress={handleSignOut} style={styles.signOutButton}>
                <MaterialCommunityIcons name="logout" size={20} color={COLORS.status.error} style={{ marginRight: SPACING.sm }} />
                <Text style={styles.signOutText}>साइन आउट</Text>
              </Pressable>

              <View style={styles.appInfo}>
                <Text style={styles.appVersion}>Sakhi v1.0</Text>
                <Text style={styles.appTagline}>सखी — आपकी साथी</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: SPACING.sm,
  },
  didiAvatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  didiAvatar: {
    fontSize: 28,
    marginBottom: 2,
  },
  menuIndicator: {
    flexDirection: 'row',
    gap: 2,
  },
  menuDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    width: '95%',
    height: height,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  menuItems: {
    flex: 1,
    paddingTop: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  menuFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    marginBottom: SPACING.md,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  signOutText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.status.error,
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersion: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  appTagline: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});