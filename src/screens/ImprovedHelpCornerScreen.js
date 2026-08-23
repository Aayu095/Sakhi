import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import { useAccessibility } from '../hooks/useAccessibility';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';

const HELP_SECTIONS = [
  {
    id: 'learning_help',
    title: 'सीखने में सहायता',
    description: 'पाठ, सखी से बात और प्रगति से जुड़े सवाल',
    iconName: 'book-open-page-variant-outline',
    tint: COLORS.primary[100],
    color: COLORS.primary[800],
    items: [
      { question: 'पाठ कैसे शुरू करें?', answer: 'होम स्क्रीन पर वीडियो या पढ़ाई का विकल्प दबाएं। फिर अपना पसंदीदा विषय चुनकर सीखना शुरू करें।' },
      { question: 'सखी से बात कैसे करें?', answer: 'होम स्क्रीन पर “सखी से बात करें” दबाएं। माइक्रोफोन की अनुमति दें और अपनी बात साफ़ आवाज़ में बोलें।' },
      { question: 'अपनी प्रगति कैसे देखें?', answer: 'होम स्क्रीन पर “मेरी प्रगति देखें” दबाएं। वहां पूरे किए गए पाठ और बैज दिखाई देंगे।' },
      { question: 'बैज कैसे मिलते हैं?', answer: 'पाठ पूरे करने, लगातार सीखने और नए विषय आजमाने से आपको बैज मिलते हैं।' },
    ],
  },
  {
    id: 'app_usage',
    title: 'ऐप चलाने में सहायता',
    description: 'आवाज़, माइक, भाषा और इंटरनेट की मदद',
    iconName: 'cellphone-cog',
    tint: COLORS.secondary[100],
    color: COLORS.secondary[800],
    items: [
      { question: 'आवाज़ सुनाई नहीं दे रही?', answer: 'फोन का वॉल्यूम जांचें। जरूरत हो तो ऐप बंद करके दोबारा खोलें और फिर कोशिश करें।' },
      { question: 'माइक काम नहीं कर रहा?', answer: 'फोन की सेटिंग्स में जाकर Sakhi ऐप के लिए माइक्रोफोन की अनुमति चालू करें।' },
      { question: 'ऐप धीमा चल रहा है?', answer: 'इंटरनेट कनेक्शन जांचें। कमजोर नेटवर्क होने पर कुछ समय बाद फिर कोशिश करें।' },
      { question: 'भाषा कैसे बदलें?', answer: 'ऊपर प्रोफाइल विकल्प में “मेरी प्रोफाइल” खोलें और भाषा चुनें।' },
    ],
  },
];

const CONTACT_OPTIONS = [
  { id: 'technical', title: 'ऐप में समस्या बताएं', subtitle: 'तकनीकी मदद चाहिए', iconName: 'tools', tint: '#FFEAE5', color: '#C2410C' },
  { id: 'feedback', title: 'सुझाव भेजें', subtitle: 'अपना अनुभव बताएं', iconName: 'message-text-outline', tint: '#E8F2FF', color: '#236FBC' },
  { id: 'feature', title: 'नई सुविधा सुझाएं', subtitle: 'आप क्या देखना चाहती हैं?', iconName: 'star-outline', tint: '#EAF8EE', color: '#15803D' },
];

const QUICK_TIPS = [
  { iconName: 'calendar-check-outline', title: 'रोज़ थोड़ा सीखें', text: 'रोज़ 10 मिनट देने से सीखना आसान बनता है।' },
  { iconName: 'stairs-up', title: 'आसान से शुरू करें', text: 'पहले सरल विषय चुनें, फिर आगे बढ़ें।' },
  { iconName: 'account-voice', title: 'धीरे और साफ़ बोलें', text: 'सखी से बात करते समय आराम से बोलें।' },
];

export default function ImprovedHelpCornerScreen() {
  const { scaleText, speak } = useAccessibility();
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const styles = useMemo(() => createStyles(scaleText), [scaleText]);
  const selectedContact = CONTACT_OPTIONS.find((option) => option.id === contactType);

  const handleFAQPress = (question) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFAQ((current) => (current === question ? null : question));
  };

  const openContactForm = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContactType(type);
    setFeedbackText('');
    setFeedbackError('');
    setShowContactModal(true);
  };

  const closeContactForm = () => {
    setShowContactModal(false);
    setContactType('');
    setFeedbackText('');
    setFeedbackError('');
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      setFeedbackError('कृपया अपना संदेश लिखें।');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('धन्यवाद', 'आपका संदेश तैयार कर लिया गया है।', [{ text: 'ठीक है', onPress: closeContactForm }]);
  };

  const callEmergencyHelp = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      const url = 'tel:1800-123-4567';
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('calling is not supported');
      await Linking.openURL(url);
    } catch {
      Alert.alert('कॉल नहीं हो पाई', 'कृपया अपने फोन से 1800-123-4567 डायल करें।');
    }
  };

  const readHelpPage = () => {
    speak('मदद कॉर्नर में सीखने और ऐप चलाने से जुड़े सवाल, संपर्क के विकल्प और आपातकालीन सहायता उपलब्ध है।');
  };

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>मदद कॉर्नर</Text>
            <Text style={styles.headerDescription}>सवालों के जवाब पाएं या हमें अपनी समस्या बताएं।</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="मदद कॉर्नर की जानकारी सुनें" onPress={readHelpPage} style={({ pressed }) => [styles.listenButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="volume-high" size={22} color={COLORS.accent[800]} />
          </Pressable>
        </View>

        <View style={styles.tipsHeading}><MaterialCommunityIcons name="lightbulb-on-outline" size={23} color={COLORS.primary[700]} /><Text style={styles.tipsTitle}>उपयोगी टिप्स</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsRow}>
          {QUICK_TIPS.map((tip) => (
            <View key={tip.title} style={styles.tipCard}>
              <View style={styles.tipIcon}><MaterialCommunityIcons name={tip.iconName} size={25} color={COLORS.primary[800]} /></View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </ScrollView>

        {HELP_SECTIONS.map((section) => (
          <View key={section.id} style={styles.helpSection}>
            <View style={styles.sectionHeading}>
              <View style={[styles.sectionIcon, { backgroundColor: section.tint }]}><MaterialCommunityIcons name={section.iconName} size={25} color={section.color} /></View>
              <View style={styles.sectionCopy}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.sectionDescription}>{section.description}</Text></View>
            </View>
            <View style={styles.faqContainer}>
              {section.items.map((item, index) => {
                const expanded = selectedFAQ === item.question;
                return (
                  <View key={item.question} style={[styles.faqItem, index === section.items.length - 1 && styles.lastFaqItem]}>
                    <Pressable accessibilityRole="button" accessibilityLabel={item.question} accessibilityHint={expanded ? 'जवाब बंद करें' : 'जवाब पढ़ने के लिए खोलें'} accessibilityState={{ expanded }} onPress={() => handleFAQPress(item.question)} style={({ pressed }) => [styles.faqQuestion, expanded && styles.faqQuestionActive, pressed && styles.pressed]}>
                      <Text style={styles.faqQuestionText}>{item.question}</Text>
                      <View style={[styles.faqChevron, expanded && styles.faqChevronActive]}><MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={22} color={expanded ? COLORS.primary[800] : COLORS.text.secondary} /></View>
                    </Pressable>
                    {expanded && <View style={styles.faqAnswer}><MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary[800]} style={styles.answerIcon} /><Text style={styles.faqAnswerText}>{item.answer}</Text></View>}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>हमें बताएं</Text>
          <Text style={styles.contactSubtitle}>अगर जवाब यहां नहीं मिला, तो अपनी बात लिखें।</Text>
          <View style={styles.contactOptions}>
            {CONTACT_OPTIONS.map((option) => (
              <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={option.title} accessibilityHint={option.subtitle} onPress={() => openContactForm(option.id)} style={({ pressed }) => [styles.contactOption, pressed && styles.pressed]}>
                <View style={[styles.contactIcon, { backgroundColor: option.tint }]}><MaterialCommunityIcons name={option.iconName} size={25} color={option.color} /></View>
                <View style={styles.contactContent}><Text style={styles.contactOptionTitle}>{option.title}</Text><Text style={styles.contactOptionSubtitle}>{option.subtitle}</Text></View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text.tertiary} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.emergencySection}>
          <View style={styles.emergencyIcon}><MaterialCommunityIcons name="phone-alert-outline" size={25} color={COLORS.status.error} /></View>
          <Text style={styles.emergencyTitle}>तुरंत सहायता चाहिए?</Text>
          <Text style={styles.emergencyText}>आपात स्थिति में सहायता नंबर पर कॉल करें।</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="आपातकालीन सहायता नंबर 1800-123-4567 पर कॉल करें" onPress={callEmergencyHelp} style={({ pressed }) => [styles.emergencyButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" /><Text style={styles.emergencyButtonText}>1800-123-4567</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showContactModal} transparent animationType="slide" onRequestClose={closeContactForm}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="संदेश फॉर्म बंद करें" onPress={closeContactForm} style={styles.modalBackdrop} />
          <View accessibilityViewIsModal style={styles.contactModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}><View style={styles.modalIcon}><MaterialCommunityIcons name={selectedContact?.iconName || 'message-text-outline'} size={24} color={selectedContact?.color || COLORS.primary[800]} /></View><Text style={styles.modalTitle}>{selectedContact?.title || 'संदेश भेजें'}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="फॉर्म बंद करें" onPress={closeContactForm} style={styles.modalCloseButton}><MaterialCommunityIcons name="close" size={21} color={COLORS.text.primary} /></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalLabel}>अपना संदेश लिखें</Text>
              <Text style={styles.modalHint}>कृपया निजी जानकारी, OTP या पासवर्ड न लिखें।</Text>
              <TextInput accessibilityLabel="अपना संदेश" value={feedbackText} onChangeText={(text) => { setFeedbackText(text); setFeedbackError(''); }} placeholder="यहां अपनी समस्या या सुझाव लिखें..." placeholderTextColor={COLORS.text.tertiary} style={[styles.modalTextInput, feedbackError && styles.inputError]} multiline numberOfLines={6} textAlignVertical="top" maxLength={900} />
              {feedbackError ? <Text accessibilityRole="alert" style={styles.formError}>{feedbackError}</Text> : null}
              <View style={styles.modalButtons}>
                <Pressable accessibilityRole="button" onPress={closeContactForm} style={({ pressed }) => [styles.modalCancelButton, pressed && styles.pressed]}><Text style={styles.modalCancelText}>रद्द करें</Text></Pressable>
                <Pressable accessibilityRole="button" onPress={handleSubmitFeedback} style={({ pressed }) => [styles.modalSubmitButton, pressed && styles.pressed]}><Text style={styles.modalSubmitText}>भेजें</Text></Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </GradientBackground>
  );
}

function createStyles(scaleText) {
  return StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: SPACING.md, paddingBottom: SPACING['2xl'] },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs, marginBottom: SPACING.md },
    headerCopy: { flex: 1, paddingRight: SPACING.sm },
    headerTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']) },
    headerDescription: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25), marginTop: 2 },
    listenButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: COLORS.accent[100] },
    tipsHeading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
    tipsTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg) },
    tipsRow: { paddingRight: SPACING.md, gap: SPACING.sm },
    tipCard: { width: 218, minHeight: 170, padding: SPACING.sm, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    tipIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, marginBottom: SPACING.xs, backgroundColor: COLORS.primary[100] },
    tipTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    tipText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(22), marginTop: 2 },
    helpSection: { marginTop: SPACING.lg },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    sectionIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 16, marginRight: SPACING.sm },
    sectionCopy: { flex: 1 },
    sectionTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg) },
    sectionDescription: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(21), marginTop: 1 },
    faqContainer: { overflow: 'hidden', borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    faqItem: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    lastFaqItem: { borderBottomWidth: 0 },
    faqQuestion: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, paddingLeft: SPACING.sm, paddingRight: SPACING.xs },
    faqQuestionActive: { backgroundColor: COLORS.primary[50] },
    faqQuestionText: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25) },
    faqChevron: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, marginLeft: SPACING.xs, backgroundColor: COLORS.neutral.gray[100] },
    faqChevronActive: { backgroundColor: COLORS.primary[100] },
    faqAnswer: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: SPACING.sm, paddingBottom: SPACING.sm, paddingTop: SPACING.xs, backgroundColor: COLORS.primary[50] },
    answerIcon: { marginRight: 7, marginTop: 2 },
    faqAnswerText: { flex: 1, color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(26) },
    contactSection: { marginTop: SPACING.lg },
    contactTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg) },
    contactSubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25), marginTop: 2, marginBottom: SPACING.sm },
    contactOptions: { gap: SPACING.sm },
    contactOption: { minHeight: 78, flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    contactIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, marginRight: SPACING.sm },
    contactContent: { flex: 1, minWidth: 0, paddingRight: SPACING.xs },
    contactOptionTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25) },
    contactOptionSubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(20), marginTop: 1 },
    emergencySection: { alignItems: 'center', padding: SPACING.md, marginTop: SPACING.lg, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F5B8B8' },
    emergencyIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginBottom: SPACING.xs, backgroundColor: '#FFFFFF' },
    emergencyTitle: { color: COLORS.status.error, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg), textAlign: 'center' },
    emergencyText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25), textAlign: 'center', marginTop: 3 },
    emergencyButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.status.error },
    emergencyButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
    contactModal: { maxHeight: '88%', padding: SPACING.md, borderTopLeftRadius: BORDER_RADIUS['2xl'], borderTopRightRadius: BORDER_RADIUS['2xl'], backgroundColor: COLORS.background.primary },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
    modalTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    modalIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, marginRight: SPACING.xs, backgroundColor: COLORS.primary[100] },
    modalTitle: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg) },
    modalCloseButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.neutral.gray[100] },
    modalContent: { paddingBottom: SPACING.sm },
    modalLabel: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), marginBottom: 3 },
    modalHint: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(21), marginBottom: SPACING.sm },
    modalTextInput: { minHeight: 142, padding: SPACING.sm, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25), backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md },
    inputError: { borderColor: COLORS.status.error, borderWidth: 2 },
    formError: { color: '#A52A2A', fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), marginTop: SPACING.xs },
    modalButtons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
    modalCancelButton: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.neutral.gray[200] },
    modalSubmitButton: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary[700] },
    modalCancelText: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    modalSubmitText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  });
}
