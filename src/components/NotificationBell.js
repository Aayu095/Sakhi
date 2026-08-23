import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';

const { width } = Dimensions.get('window');

// Presentation data only. Delivery/persistence behavior intentionally remains unchanged.
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    title: 'नया पाठ उपलब्ध है',
    message: 'स्वास्थ्य और स्वच्छता के बारे में नया वीडियो देखें।',
    time: '2 मिनट पहले',
    type: 'lesson',
    icon: 'book-open-variant',
    read: false,
    priority: 'high',
  },
  {
    id: '2',
    title: 'बहुत बढ़िया!',
    message: 'आपने 7 दिन लगातार सीखा है। नया बैज खुल गया है।',
    time: '1 घंटा पहले',
    type: 'achievement',
    icon: 'trophy-outline',
    read: false,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'दीदी का संदेश',
    message: 'शिक्षा ही महिलाओं की सबसे बड़ी शक्ति है।',
    time: '3 घंटे पहले',
    type: 'message',
    icon: 'message-text-outline',
    read: true,
    priority: 'low',
  },
  {
    id: '4',
    title: 'समुदाय अपडेट',
    message: 'आपके क्षेत्र में 50 से ज्यादा महिलाओं ने नए कौशल सीखे हैं।',
    time: '5 घंटे पहले',
    type: 'community',
    icon: 'account-group-outline',
    read: true,
    priority: 'low',
  },
  {
    id: '5',
    title: 'सरकारी योजना अलर्ट',
    message: 'नई महिला उद्यमिता योजना के लिए आवेदन कर सकती हैं।',
    time: '1 दिन पहले',
    type: 'scheme',
    icon: 'bank-outline',
    read: true,
    priority: 'high',
  },
];

const TYPE_STYLE = {
  lesson: { tint: '#E8F2FF', color: '#236FBC', action: 'पाठ देखें' },
  achievement: { tint: '#FFF0D8', color: '#A4600B', action: 'प्रगति देखें' },
  message: { tint: '#F2ECFF', color: '#6C3483', action: 'पढ़ें' },
  community: { tint: '#E4F8F3', color: '#0F766E', action: 'समुदाय देखें' },
  scheme: { tint: '#FFF1E4', color: '#A74F19', action: 'जानकारी देखें' },
};

export default function NotificationBell({ navigation }) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsNotificationVisible(true);
  };

  const closePanel = () => setIsNotificationVisible(false);

  const handleNotificationItemPress = (notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications((items) => items.map((item) => (
      item.id === notification.id ? { ...item, read: true } : item
    )));
    closePanel();

    setTimeout(() => {
      switch (notification.type) {
        case 'lesson':
          navigation.navigate('VideoLearningCategories');
          break;
        case 'achievement':
          navigation.navigate('SeparateProgress');
          break;
        case 'community':
          navigation.navigate('Community');
          break;
        case 'scheme':
          navigation.navigate('ModuleLearningCategories');
          break;
        default:
          break;
      }
    }, 250);
  };

  const markAllAsRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const clearAllNotifications = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifications([]);
    closePanel();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unreadCount > 0 ? `सूचनाएं, ${unreadCount} नई` : 'सूचनाएं'}
        accessibilityHint="सूचनाओं की सूची खोलें"
        accessibilityState={{ expanded: isNotificationVisible }}
        onPress={handleNotificationPress}
        style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name={unreadCount > 0 ? 'bell-ring-outline' : 'bell-outline'} size={24} color="#FFFFFF" />
        {unreadCount > 0 && (
          <View style={styles.notificationBadge} accessible={false}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={isNotificationVisible}
        transparent
        animationType="slide"
        onRequestClose={closePanel}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <Pressable accessibilityRole="button" accessibilityLabel="सूचनाएं बंद करें" style={styles.backdrop} onPress={closePanel} />

          <View accessibilityViewIsModal style={styles.notificationPanel}>
            <View style={styles.notificationHeader}>
              <View style={styles.headerIcon}><MaterialCommunityIcons name="bell-outline" size={25} color={COLORS.accent[800]} /></View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>सूचनाएं</Text>
                <Text style={styles.headerSubtitle}>
                  {unreadCount > 0 ? `${unreadCount} नई सूचना${unreadCount > 1 ? 'एं' : ''}` : 'आप सब जानकारी देख चुकी हैं'}
                </Text>
              </View>
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <Pressable accessibilityRole="button" accessibilityLabel="सभी सूचनाएं पढ़ी हुई मानें" onPress={markAllAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAllText}>सभी पढ़ें</Text>
                  </Pressable>
                )}
                <Pressable accessibilityRole="button" accessibilityLabel="सूचनाएं बंद करें" onPress={closePanel} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={22} color={COLORS.text.primary} />
                </Pressable>
              </View>
            </View>

            <ScrollView style={styles.notificationList} contentContainerStyle={notifications.length === 0 && styles.emptyListContent} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View accessibilityRole="text" style={styles.emptyState}>
                  <View style={styles.emptyIcon}><MaterialCommunityIcons name="bell-check-outline" size={42} color={COLORS.secondary[800]} /></View>
                  <Text style={styles.emptyTitle}>अभी कोई नई सूचना नहीं</Text>
                  <Text style={styles.emptySubtitle}>नई जानकारी आने पर यहाँ दिखेगी।</Text>
                </View>
              ) : (
                notifications.map((notification) => {
                  const typeStyle = TYPE_STYLE[notification.type] || TYPE_STYLE.message;
                  const isUrgent = notification.priority === 'high';
                  return (
                    <Pressable
                      key={notification.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${notification.read ? 'पढ़ी हुई' : 'नई'} सूचना: ${notification.title}, ${notification.time}`}
                      accessibilityHint={typeStyle.action}
                      onPress={() => handleNotificationItemPress(notification)}
                      style={({ pressed }) => [styles.notificationItem, !notification.read && styles.unreadNotification, pressed && styles.itemPressed]}
                    >
                      <View style={[styles.notificationIcon, { backgroundColor: typeStyle.tint }]}>
                        <MaterialCommunityIcons name={notification.icon} size={25} color={typeStyle.color} />
                      </View>
                      <View style={styles.notificationContent}>
                        <View style={styles.itemMetaRow}>
                          {!notification.read && <View style={styles.newPill}><Text style={styles.newPillText}>नई</Text></View>}
                          {isUrgent && <View style={styles.priorityPill}><MaterialCommunityIcons name="alert-circle-outline" size={12} color="#A34E19" /><Text style={styles.priorityText}>ज़रूरी</Text></View>}
                          <Text style={styles.notificationTime}>{notification.time}</Text>
                        </View>
                        <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>{notification.title}</Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>{notification.message}</Text>
                        <View style={styles.openRow}><Text style={[styles.openText, { color: typeStyle.color }]}>{typeStyle.action}</Text><MaterialCommunityIcons name="arrow-right" size={15} color={typeStyle.color} /></View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {notifications.length > 0 && (
              <View style={styles.notificationFooter}>
                <Text style={styles.footerText}>कुल {notifications.length} सूचनाएं</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="सभी सूचनाएं साफ़ करें" onPress={clearAllNotifications} style={styles.clearAllButton}>
                  <MaterialCommunityIcons name="delete-outline" size={19} color={COLORS.status.error} />
                  <Text style={styles.clearAllText}>सभी साफ़ करें</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notificationButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 2, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 3, right: 3, minWidth: 20, height: 20, paddingHorizontal: 3, borderRadius: 10, backgroundColor: COLORS.status.error, borderWidth: 2, borderColor: COLORS.primary[800], alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 10 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.94 }] },
  modalContainer: { flex: 1, backgroundColor: 'transparent' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  notificationPanel: { width: Math.min(width * 0.92, 420), height: '100%', alignSelf: 'flex-end', backgroundColor: COLORS.background.primary, shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 12 },
  notificationHeader: { minHeight: 112, flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.lg, paddingHorizontal: SPACING.md, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent[100], alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  headerInfo: { flex: 1 },
  headerTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.xl },
  headerSubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.xs, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 9, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary[100] },
  markAllText: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 12 },
  closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.neutral.gray[100], alignItems: 'center', justifyContent: 'center' },
  notificationList: { flex: 1 },
  emptyListContent: { flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.secondary[100], alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  emptyTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.lg, textAlign: 'center' },
  emptySubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25, textAlign: 'center', marginTop: SPACING.xs },
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: SPACING.sm, marginTop: SPACING.sm, padding: SPACING.sm, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.xl },
  unreadNotification: { backgroundColor: '#FFFCF5', borderColor: COLORS.primary[200], borderLeftWidth: 4, borderLeftColor: COLORS.primary[600] },
  itemPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  notificationIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  notificationContent: { flex: 1, minWidth: 0 },
  itemMetaRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  newPill: { backgroundColor: COLORS.primary[100], paddingHorizontal: 7, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  newPillText: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 10 },
  priorityPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFF0E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  priorityText: { color: '#A34E19', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 10 },
  notificationTime: { marginLeft: 'auto', color: COLORS.text.tertiary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 11 },
  notificationTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25, marginTop: 2 },
  unreadTitle: { fontFamily: TYPOGRAPHY.fontFamily.bold },
  notificationMessage: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.xs, lineHeight: 22, marginTop: 1 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  openText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 12 },
  notificationFooter: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.xs },
  clearAllButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: '#FFF0F0' },
  clearAllText: { color: COLORS.status.error, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.xs },
});
