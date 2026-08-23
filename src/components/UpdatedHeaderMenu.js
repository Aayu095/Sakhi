import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import SignOutConfirmation from '../components/SignOutConfirmation';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
  {
    id: 'profile',
    title: 'मेरी प्रोफाइल',
    subtitle: 'नाम और भाषा बदलें',
    icon: 'account-outline',
    screen: 'Settings',
    tint: COLORS.primary[100],
    color: COLORS.primary[800],
  },
  {
    id: 'community',
    title: 'समुदाय से जुड़ें',
    subtitle: 'सहेलियों से सीखें और अनुभव साझा करें',
    icon: 'account-group-outline',
    screen: 'Community',
    tint: COLORS.secondary[100],
    color: COLORS.secondary[800],
  },
  {
    id: 'help',
    title: 'मदद कॉर्नर',
    subtitle: 'किसी भी सवाल में सहायता पाएं',
    icon: 'help-circle-outline',
    screen: 'HelpCorner',
    tint: '#E8F2FF',
    color: '#236FBC',
  },
];

export default function UpdatedHeaderMenu({ navigation }) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const { profile, signOut } = useAuth();

  const userName = profile?.name?.split(' ')[0] || 'सखी';
  const userInitial = profile?.name?.charAt(0)?.toUpperCase() || 'द';

  const closeMenu = () => setIsMenuVisible(false);

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMenuVisible(true);
  };

  const handleMenuItemPress = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeMenu();
    setTimeout(() => navigation.navigate(item.screen), 250);
  };

  const handleSignOut = () => {
    setSignOutError('');
    setShowSignOutConfirm(true);
  };

  const cancelSignOut = () => {
    if (!isSigningOut) {
      setShowSignOutConfirm(false);
      setSignOutError('');
    }
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError('');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await signOut();
    } catch (error) {
      setSignOutError(error?.message || 'साइन आउट नहीं हो पाया। इंटरनेट जांचकर फिर कोशिश करें।');
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="प्रोफाइल और विकल्प"
        accessibilityHint="प्रोफाइल, समुदाय और मदद के विकल्प खोलें"
        accessibilityState={{ expanded: isMenuVisible }}
        onPress={handleMenuPress}
        style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="account-circle-outline" size={27} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <Pressable accessibilityRole="button" accessibilityLabel="प्रोफाइल विकल्प बंद करें" onPress={closeMenu} style={styles.backdrop} />

          <View accessibilityViewIsModal style={styles.menuPanel}>
            <View style={styles.menuHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar} accessible={false}>
                  <Text style={styles.userAvatarText}>{userInitial}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.accountLabel}>आपका खाता</Text>
                  <Text style={styles.userName}>नमस्ते, {userName}</Text>
                  <Text style={styles.userSubtitle}>अपनी सीखने की यात्रा आगे बढ़ाएं</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="प्रोफाइल विकल्प बंद करें" onPress={closeMenu} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={22} color={COLORS.text.primary} />
              </Pressable>
            </View>

            <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuItems} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>त्वरित विकल्प</Text>
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  accessibilityHint={item.subtitle}
                  onPress={() => handleMenuItemPress(item)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.itemPressed]}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.tint }]}>
                    <MaterialCommunityIcons name={item.icon} size={25} color={item.color} />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text.tertiary} />
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.menuFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="साइन आउट"
                accessibilityHint="इस उपकरण से आपका खाता साइन आउट होगा"
                onPress={handleSignOut}
                style={({ pressed }) => [styles.signOutButton, pressed && styles.itemPressed]}
              >
                <MaterialCommunityIcons name="logout" size={20} color={COLORS.status.error} />
                <Text style={styles.signOutText}>साइन आउट</Text>
              </Pressable>
              <Text style={styles.appTagline}>सखी — आपकी साथी</Text>
            </View>
          </View>
        </View>
      </Modal>

      <SignOutConfirmation
        visible={showSignOutConfirm}
        busy={isSigningOut}
        error={signOutError}
        onCancel={cancelSignOut}
        onConfirm={confirmSignOut}
      />
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.94 }] },
  modalContainer: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  menuPanel: { width: Math.min(width * 0.92, 420), height: '100%', alignSelf: 'flex-end', backgroundColor: COLORS.background.primary, shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 12 },
  menuHeader: { minHeight: 132, flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.lg, paddingHorizontal: SPACING.md, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  userAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm, backgroundColor: COLORS.primary[500], borderWidth: 3, borderColor: COLORS.primary[100] },
  userAvatarText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.xl },
  userDetails: { flex: 1, minWidth: 0 },
  accountLabel: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 12 },
  userName: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.lg, marginTop: 1 },
  userSubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 12, lineHeight: 19, marginTop: 1 },
  closeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.xs, backgroundColor: COLORS.neutral.gray[100] },
  menuScroll: { flex: 1 },
  menuItems: { padding: SPACING.md, gap: SPACING.sm },
  sectionLabel: { color: COLORS.text.tertiary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 12, letterSpacing: 0.4, marginBottom: 2 },
  menuItem: { minHeight: 84, flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
  itemPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  menuIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  menuItemContent: { flex: 1, minWidth: 0, paddingRight: SPACING.xs },
  menuItemTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25 },
  menuItemSubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 12, lineHeight: 19, marginTop: 1 },
  menuFooter: { padding: SPACING.md, paddingBottom: SPACING.lg, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: COLORS.border },
  signOutButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: '#FFF0F0' },
  signOutText: { color: COLORS.status.error, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  appTagline: { color: COLORS.text.tertiary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 11, textAlign: 'center', marginTop: SPACING.sm },
});
