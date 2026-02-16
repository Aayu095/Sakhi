import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

export default function ImprovedHelpCornerScreen({ navigation }) {
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const helpSections = [
    {
      id: 'learning_help',
      title: 'सीखने में परेशानी है?',
      subtitle: 'Learning difficulties?',
      iconName: 'book-open-page-variant',
      color: COLORS.primary[500],
      items: [
        {
          question: 'पाठ कैसे शुरू करें?',
          answer: 'होम स्क्रीन पर "पाठ शुरू करें" बटन दबाएं। फिर अपना मनपसंद विषय चुनें और सीखना शुरू करें।'
        },
        {
          question: 'सखी से बात कैसे करें?',
          answer: 'होम स्क्रीन पर "सखी को कॉल करें" बटन दबाएं। माइक्रोफोन की अनुमति दें और सखी से बात करना शुरू करें।'
        },
        {
          question: 'अपनी प्रगति कैसे देखें?',
          answer: 'मेन्यू में "मेरी प्रगति" पर जाएं। वहां आप अपने पूरे किए गए पाठ और बैज देख सकते हैं।'
        },
        {
          question: 'बैज कैसे मिलते हैं?',
          answer: 'पाठ पूरे करने, लगातार सीखने और नए विषय सीखने से आपको बैज मिलते हैं।'
        }
      ]
    },
    {
      id: 'app_usage',
      title: 'ऐप कैसे चलाएं?',
      subtitle: 'How to use app?',
      iconName: 'cellphone',
      color: COLORS.primary[500],
      items: [
        {
          question: 'आवाज़ सुनाई नहीं दे रही?',
          answer: 'फोन का वॉल्यूम चेक करें। सेटिंग्स में जाकर ऑडियो सेटिंग्स देखें।'
        },
        {
          question: 'माइक काम नहीं कर रहा?',
          answer: 'ऐप को माइक्रोफोन की अनुमति दें। फोन की सेटिंग्स में जाकर Sakhi ऐप के लिए माइक की अनुमति चालू करें।'
        },
        {
          question: 'ऐप धीमा चल रहा है?',
          answer: 'इंटरनेट कनेक्शन चेक करें। ऐप को बंद करके दोबारा खोलें।'
        },
        {
          question: 'भाषा कैसे बदलें?',
          answer: 'मेन्यू में "मेरी प्रोफाइल" में जाकर भाषा की सेटिंग्स बदल सकते हैं।'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      id: 'technical',
      title: 'तकनीकी सहायता',
      subtitle: 'App ki problem',
      iconName: 'tools',
      color: COLORS.status.error,
    },
    {
      id: 'feedback',
      title: 'फीडबैक',
      subtitle: 'Your suggestions',
      iconName: 'message-text',
      color: COLORS.status.info,
    },
    {
      id: 'feature',
      title: 'नई सुविधा का अनुरोध',
      subtitle: 'Request new feature',
      iconName: 'star-circle',
      color: COLORS.status.success,
    }
  ];

  const quickTips = [
    {
      iconName: 'lightbulb-on',
      title: 'टिप 1',
      text: 'रोज़ाना 10 मिनट सीखने से बेहतर परिणाम मिलते हैं'
    },
    {
      iconName: 'target',
      title: 'टिप 2',
      text: 'पहले आसान विषय चुनें, फिर कठिन की तरफ बढ़ें'
    },
    {
      iconName: 'account-voice',
      title: 'टिप 3',
      text: 'सखी से बात करते समय साफ़ और धीरे बोलें'
    }
  ];

  const handleFAQPress = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFAQ(selectedFAQ === item ? null : item);
  };

  const handleContactPress = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContactType(type);
    setShowContactModal(true);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('त्रुटि', 'कृपया अपना संदेश लिखें।');
      return;
    }

    // In real app, send to backend
    Alert.alert(
      'धन्यवाद!',
      'आपका संदेश हमें मिल गया है। हम जल्द ही आपसे संपर्क करेंगे।',
      [{
        text: 'ठीक है', onPress: () => {
          setShowContactModal(false);
          setFeedbackText('');
          setContactType('');
        }
      }]
    );
  };

  const renderHelpSection = (section) => (
    <View key={section.id}
      delay={200}
      style={styles.helpSection}
    >
      <View style={[styles.sectionHeader, { backgroundColor: section.color }]}>
        <MaterialCommunityIcons name={section.iconName} size={28} color="#FFFFFF" style={styles.sectionIcon} />
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        </View>
      </View>

      <View style={styles.faqContainer}>
        {section.items.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Pressable
              onPress={() => handleFAQPress(item)}
              style={[
                styles.faqQuestion,
                selectedFAQ === item && styles.faqQuestionActive
              ]}
            >
              <Text style={styles.faqQuestionText}>{item.question}</Text>
              <Text style={[
                styles.faqArrow,
                selectedFAQ === item && styles.faqArrowActive
              ]}>
                {selectedFAQ === item ? '−' : '+'}
              </Text>
            </Pressable>

            {selectedFAQ === item && (
              <View style={styles.faqAnswer}
              >
                <Text style={styles.faqAnswerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>मदद कॉर्नर</Text>
          <Text style={styles.headerSubtitle}>Help & Support</Text>
          <Text style={styles.headerDescription}>
            सखी आपकी हर समस्या का समाधान लेकर आई है
          </Text>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsTitleRow}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color={COLORS.primary[600]} />
            <Text style={styles.tipsTitle}> उपयोगी टिप्स</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickTips.map((tip, index) => (
              <View key={index}
                delay={index * 100}
                style={styles.tipCard}
              >
                <MaterialCommunityIcons name={tip.iconName} size={32} color={COLORS.primary[500]} style={styles.tipIconMaterial} />
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Help Sections */}
        {helpSections.map(renderHelpSection)}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>हमसे संपर्क करें</Text>
          <Text style={styles.contactSubtitle}>
            कोई और समस्या है? हमें बताएं
          </Text>

          <View style={styles.contactOptions}>
            {contactOptions.map((option, index) => (
              <View key={option.id}
                delay={index * 100}
              >
                <Pressable
                  onPress={() => handleContactPress(option.id)}
                  style={[styles.contactOption, { borderColor: option.color }]}
                >
                  <View style={[styles.contactIcon, { backgroundColor: option.color }]}>
                    <MaterialCommunityIcons name={option.iconName} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.contactContent}>
                    <Text style={styles.contactOptionTitle}>{option.title}</Text>
                    <Text style={styles.contactOptionSubtitle}>{option.subtitle}</Text>
                  </View>
                  <Text style={styles.contactArrow}>›</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyTitleRow}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={COLORS.status.error} />
            <Text style={styles.emergencyTitle}> आपातकालीन सहायता</Text>
          </View>
          <Text style={styles.emergencyText}>
            तुरंत मदद चाहिए? हमारी हेल्पलाइन पर कॉल करें
          </Text>
          <Pressable
            onPress={() => Linking.openURL('tel:1800-123-4567')}
            style={styles.emergencyButton}
          >
            <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.emergencyButtonText}>1800-123-4567</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <BlurView intensity={80} style={styles.modalOverlay}>
          <View style={styles.contactModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {contactOptions.find(o => o.id === contactType)?.title}
              </Text>
              <Pressable
                onPress={() => setShowContactModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>अपना संदेश लिखें:</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="यहां अपनी समस्या या सुझाव लिखें..."
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setShowContactModal(false)}
                  style={[styles.modalButton, styles.modalCancelButton]}
                >
                  <Text style={styles.modalCancelText}>रद्द करें</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmitFeedback}
                  style={[styles.modalButton, styles.modalSubmitButton]}
                >
                  <Text style={styles.modalSubmitText}>भेजें</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  headerDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tipsSection: {
    marginBottom: SPACING.lg,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  tipCard: {
    width: 180,
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipIconMaterial: {
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  helpSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#fff',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  faqContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  faqQuestionActive: {
    backgroundColor: COLORS.primary[50],
  },
  faqQuestionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  faqArrow: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  faqArrowActive: {
    color: COLORS.primary[600],
  },
  faqAnswer: {
    padding: SPACING.md,
    paddingTop: 0,
    backgroundColor: COLORS.primary[25],
  },
  faqAnswerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  contactSection: {
    marginBottom: SPACING.lg,
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  contactSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  contactOptions: {
    gap: SPACING.sm,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  contactIconText: {
    fontSize: 18,
  },
  contactContent: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  contactArrow: {
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  emergencySection: {
    backgroundColor: COLORS.status.error + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.status.error + '40',
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emergencyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.status.error,
  },
  emergencyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
  },
  emergencyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contactModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  modalTextInput: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.neutral.gray[200],
  },
  modalSubmitButton: {
    backgroundColor: COLORS.primary[500],
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  modalSubmitText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#fff',
  },
});