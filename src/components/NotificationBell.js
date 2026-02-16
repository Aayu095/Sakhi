import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

const { width, height } = Dimensions.get('window');

// Sample notifications data - in a real app, this would come from a backend
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    title: 'नया पाठ उपलब्ध है!',
    subtitle: 'New Lesson Available!',
    message: 'स्वास्थ्य और स्वच्छता के बारे में नया वीडियो देखें',
    time: '2 मिनट पहले',
    type: 'lesson',
    icon: 'book-open-variant',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    title: 'बधाई हो!',
    subtitle: 'Congratulations!',
    message: 'आपने 7 दिन लग���तार सीखा है! नया बैज अनलॉक हुआ',
    time: '1 घंटा पहले',
    type: 'achievement',
    icon: 'trophy',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    title: 'दीदी का संदेश',
    subtitle: 'Message from Didi',
    message: 'आज का प्रेरणादायक विचार: "शिक्षा ही महिलाओं की सबसे बड़ी शक्ति है"',
    time: '3 घंटे पहले',
    type: 'message',
    icon: 'message-text',
    read: true,
    priority: 'low'
  },
  {
    id: '4',
    title: 'समुदाय अपडेट',
    subtitle: 'Community Update',
    message: 'आपके क्षेत्र में 50+ महिलाओं ने नए कौशल सीखे हैं',
    time: '5 घंटे पहले',
    type: 'community',
    icon: 'account-group',
    read: true,
    priority: 'low'
  },
  {
    id: '5',
    title: 'सरकारी योजना अलर्ट',
    subtitle: 'Government Scheme Alert',
    message: 'नई महिला उद्यमिता योजना के लिए आवेदन करें',
    time: '1 दिन पहले',
    type: 'scheme',
    icon: 'bank',
    read: true,
    priority: 'high'
  }
];

export default function NotificationBell({ navigation }) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const { profile } = useAuth();

  // Check for unread notifications
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setHasNewNotifications(unreadCount > 0);
  }, [notifications]);

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsNotificationVisible(true);
  };

  const handleNotificationItemPress = (notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mark notification as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Handle navigation based on notification type
    setIsNotificationVisible(false);

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
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifications([]);
    setIsNotificationVisible(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.status.error;
      case 'medium':
        return COLORS.status.warning;
      case 'low':
        return COLORS.status.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell Button */}
      <Pressable onPress={handleNotificationPress} style={styles.notificationButton}>
        <View style={styles.bellContainer}>
          <MaterialCommunityIcons name="bell" size={24} color="#FFFFFF" />
          {hasNewNotifications && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Notification Panel Modal */}
      <Modal
        visible={isNotificationVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsNotificationVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setIsNotificationVisible(false)}
          />

          <View style={styles.notificationPanel}>
            {/* Notification Header */}
            <View style={styles.notificationHeader}>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>सूचनाएं</Text>
                <Text style={styles.headerSubtitle}>Notifications</Text>
              </View>

              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <Pressable
                    onPress={markAllAsRead}
                    style={styles.markAllButton}
                  >
                    <Text style={styles.markAllText}>सभी पढ़ें</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => setIsNotificationVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>
            </View>

            {/* Notification List */}
            <ScrollView
              style={styles.notificationList}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="bell-outline" size={64} color={COLORS.text.tertiary} style={{ marginBottom: SPACING.md }} />
                  <Text style={styles.emptyTitle}>कोई सूचना नहीं</Text>
                  <Text style={styles.emptySubtitle}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((notification, index) => (
                  <View key={notification.id}>
                    <Pressable
                      onPress={() => handleNotificationItemPress(notification)}
                      style={[
                        styles.notificationItem,
                        !notification.read && styles.unreadNotification
                      ]}
                    >
                      <View style={styles.notificationIcon}>
                        <MaterialCommunityIcons
                          name={notification.icon}
                          size={28}
                          color={COLORS.primary[500]}
                        />
                        {notification.priority === 'high' && (
                          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(notification.priority) }]} />
                        )}
                      </View>

                      <View style={styles.notificationContent}>
                        <View style={styles.notificationTitleRow}>
                          <Text style={[
                            styles.notificationTitle,
                            !notification.read && styles.unreadTitle
                          ]}>
                            {notification.title}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {notification.time}
                          </Text>
                        </View>

                        <Text style={styles.notificationSubtitle}>
                          {notification.subtitle}
                        </Text>

                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>

                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>

                      <Text style={styles.notificationArrow}>›</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Notification Footer */}
            {notifications.length > 0 && (
              <View style={styles.notificationFooter}>
                <Pressable
                  onPress={clearAllNotifications}
                  style={styles.clearAllButton}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.status.error} style={{ marginRight: SPACING.xs }} />
                  <Text style={styles.clearAllText}>सभी साफ़ करें</Text>
                </Pressable>

                <View style={styles.footerInfo}>
                  <Text style={styles.footerText}>
                    कुल {notifications.length} सूचनाएं
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal >
    </>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    padding: SPACING.sm,
    marginRight: SPACING.xs,
  },
  bellContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  notificationPanel: {
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
  notificationHeader: {
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  markAllButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[100],
  },
  markAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
  notificationList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(166, 124, 82, 0.05)',
  },
  notificationIcon: {
    position: 'relative',
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  notificationIconText: {
    fontSize: 24,
  },
  priorityIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  priorityText: {
    fontSize: 8,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadTitle: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  notificationSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[500],
  },
  notificationArrow: {
    fontSize: 20,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  clearAllIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  clearAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.status.error,
  },
  footerInfo: {
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
});