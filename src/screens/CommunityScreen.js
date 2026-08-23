import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAuth } from '../providers/AuthProvider';
import {
  createCommunityStory,
  createHelpRequest,
  ensureCommunityProfile,
  offerCommunityHelp,
  reportCommunityContent,
  subscribeToHelpRequests,
  subscribeToStories,
} from '../services/communityService';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';
import GradientBackground from '../components/GradientBackground';

const STORY_CATEGORIES = ['सीखना', 'डिजिटल', 'स्वास्थ्य', 'काम-कौशल'];
const HELP_CATEGORIES = ['सीखना', 'फोन/इंटरनेट', 'सरकारी योजना', 'व्यावहारिक काम'];

function timestampLabel(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'अभी-अभी';
  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} मिनट पहले`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} घंटे पहले`;
  return `${Math.floor(hours / 24)} दिन पहले`;
}

export default function CommunityScreen() {
  const { profile, user } = useAuth();
  const { scaleText, speak } = useAccessibility();
  const [activeTab, setActiveTab] = useState('stories');
  const [stories, setStories] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [helpLoading, setHelpLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const styles = useMemo(() => createStyles(scaleText), [scaleText]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    let active = true;
    setStoriesLoading(true);
    setHelpLoading(true);
    setError('');

    ensureCommunityProfile(user, profile).catch((reason) => {
      if (active) setError(reason?.message || 'Community प्रोफाइल तैयार नहीं हो पाई।');
    });

    const stopStories = subscribeToStories(
      (items) => { if (active) { setStories(items); setStoriesLoading(false); } },
      (reason) => { if (active) { setStoriesLoading(false); setError(reason?.message || 'कहानियां लोड नहीं हो पाईं।'); } },
    );
    const stopHelp = subscribeToHelpRequests(
      (items) => { if (active) { setHelpRequests(items.filter((item) => !item.isResolved)); setHelpLoading(false); } },
      (reason) => { if (active) { setHelpLoading(false); setError(reason?.message || 'मदद के अनुरोध लोड नहीं हुए।'); } },
    );

    return () => {
      active = false;
      stopStories();
      stopHelp();
    };
  }, [user?.uid, refreshKey]);

  const submitStory = async (form) => {
    try {
      await createCommunityStory(user, profile, form);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowStoryForm(false);
      Alert.alert('कहानी साझा हो गई', 'आपकी कहानी अब Community में दिखेगी।');
    } catch (reason) {
      Alert.alert('कहानी साझा नहीं हो पाई', reason?.message || 'कृपया फिर कोशिश करें।');
      throw reason;
    }
  };

  const submitHelp = async (form) => {
    try {
      await createHelpRequest(user, profile, form);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowHelpForm(false);
      Alert.alert('मदद का अनुरोध भेज दिया', 'Community की सहेलियां इसे देख सकेंगी।');
    } catch (reason) {
      Alert.alert('अनुरोध भेजा नहीं जा पाया', reason?.message || 'कृपया फिर कोशिश करें।');
      throw reason;
    }
  };

  const submitOffer = async (message) => {
    if (!selectedRequest) return;
    try {
      await offerCommunityHelp(user, profile, selectedRequest.id, message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedRequest(null);
      Alert.alert('आपका संदेश भेज दिया गया', 'जिस बहन ने मदद मांगी है, वह इसे देख सकेगी।');
    } catch (reason) {
      Alert.alert('संदेश नहीं भेजा जा पाया', reason?.message || 'कृपया फिर कोशिश करें।');
      throw reason;
    }
  };

  const reportItem = (type, item) => {
    Alert.alert('रिपोर्ट करें', 'क्या यह सामग्री अनुचित या असुरक्षित है?', [
      { text: 'रद्द करें', style: 'cancel' },
      {
        text: 'रिपोर्ट करें',
        style: 'destructive',
        onPress: async () => {
          try {
            await reportCommunityContent(user, type, item.id, 'अनुचित या असुरक्षित सामग्री');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('रिपोर्ट भेज दी गई', 'सुरक्षा जांच के लिए रिपोर्ट दर्ज हो गई है।');
          } catch (reason) {
            Alert.alert('रिपोर्ट नहीं भेजी जा पाई', reason?.message || 'कृपया फिर कोशिश करें।');
          }
        },
      },
    ]);
  };

  const isLoading = activeTab === 'stories' ? storiesLoading : helpLoading;
  const visibleItems = activeTab === 'stories' ? stories : helpRequests;

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>समुदाय</Text>
            <Text style={styles.headerSubtitle}>सीखें, अनुभव साझा करें और सुरक्षित मदद पाएं</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Community पेज सुनें" onPress={() => speak(`Community में ${stories.length} कहानियां और ${helpRequests.length} मदद के अनुरोध हैं।`)} style={styles.listenButton}>
            <MaterialCommunityIcons name="volume-high" size={21} color={COLORS.accent[800]} />
          </Pressable>
        </View>

        <View style={styles.safetyNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color={COLORS.secondary[800]} />
          <Text style={styles.safetyText}>फोन नंबर, OTP, पता या निजी जानकारी साझा न करें।</Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="मदद मांगें" onPress={() => setShowHelpForm(true)} style={[styles.quickAction, styles.helpAction]}>
            <MaterialCommunityIcons name="hand-heart-outline" size={25} color={COLORS.secondary[800]} />
            <Text style={styles.quickActionText}>मदद मांगें</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="अपनी कहानी साझा करें" onPress={() => setShowStoryForm(true)} style={[styles.quickAction, styles.storyAction]}>
            <MaterialCommunityIcons name="text-box-check-outline" size={25} color={COLORS.primary[800]} />
            <Text style={styles.quickActionText}>कहानी साझा करें</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <TabButton label="कहानियां" active={activeTab === 'stories'} onPress={() => setActiveTab('stories')} styles={styles} />
          <TabButton label="मदद के अनुरोध" active={activeTab === 'help'} onPress={() => setActiveTab('help')} styles={styles} />
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="cloud-alert-outline" size={30} color={COLORS.status.error} />
            <Text style={styles.errorTitle}>Community लोड नहीं हो पाई</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => setRefreshKey((value) => value + 1)} style={styles.retryButton}><Text style={styles.retryButtonText}>फिर कोशिश करें</Text></Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingState}><ActivityIndicator size="large" color={COLORS.primary[600]} /><Text style={styles.loadingText}>Community लोड हो रही है...</Text></View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {visibleItems.length === 0 ? (
              <EmptyState tab={activeTab} onStory={() => setShowStoryForm(true)} onHelp={() => setShowHelpForm(true)} styles={styles} />
            ) : activeTab === 'stories' ? (
              stories.map((story) => <StoryCard key={story.id} story={story} onReport={() => reportItem('story', story)} styles={styles} />)
            ) : (
              helpRequests.map((request) => <HelpCard key={request.id} request={request} isOwnRequest={request.authorId === user?.uid} onOffer={() => setSelectedRequest(request)} onReport={() => reportItem('help', request)} styles={styles} />)
            )}
          </ScrollView>
        )}
      </View>

      <StoryForm visible={showStoryForm} onClose={() => setShowStoryForm(false)} onSubmit={submitStory} styles={styles} />
      <HelpForm visible={showHelpForm} onClose={() => setShowHelpForm(false)} onSubmit={submitHelp} styles={styles} />
      <OfferForm request={selectedRequest} onClose={() => setSelectedRequest(null)} onSubmit={submitOffer} styles={styles} />
    </GradientBackground>
  );
}

function TabButton({ label, active, onPress, styles }) {
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.tabButton, active && styles.activeTabButton]}><Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text></Pressable>;
}

function StoryCard({ story, onReport, styles }) {
  return <View style={styles.itemCard}><View style={styles.itemTop}><View style={styles.authorCircle}><Text style={styles.authorInitial}>{(story.authorName || 'स').charAt(0)}</Text></View><View style={styles.itemTopCopy}><Text style={styles.authorName}>{story.authorName || 'सखी की सहेली'}</Text><Text style={styles.itemTime}>{timestampLabel(story.createdAt)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="इस कहानी की रिपोर्ट करें" onPress={onReport} style={styles.reportButton}><MaterialCommunityIcons name="flag-outline" size={19} color={COLORS.text.tertiary} /></Pressable></View><View style={styles.categoryPill}><Text style={styles.categoryText}>{story.category}</Text></View><Text style={styles.itemTitle}>{story.title}</Text><Text style={styles.itemContent}>{story.content}</Text></View>;
}

function HelpCard({ request, isOwnRequest, onOffer, onReport, styles }) {
  return <View style={styles.itemCard}><View style={styles.itemTop}><View style={[styles.authorCircle, styles.helpAvatar]}><MaterialCommunityIcons name="hand-heart-outline" size={20} color={COLORS.secondary[800]} /></View><View style={styles.itemTopCopy}><Text style={styles.authorName}>{request.authorName || 'सखी की सहेली'} को मदद चाहिए</Text><Text style={styles.itemTime}>{timestampLabel(request.createdAt)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="इस अनुरोध की रिपोर्ट करें" onPress={onReport} style={styles.reportButton}><MaterialCommunityIcons name="flag-outline" size={19} color={COLORS.text.tertiary} /></Pressable></View><View style={[styles.categoryPill, styles.helpCategoryPill]}><Text style={[styles.categoryText, styles.helpCategoryText]}>{request.category}</Text></View><Text style={styles.itemTitle}>{request.title}</Text><Text style={styles.itemContent}>{request.description}</Text>{!isOwnRequest && <Pressable accessibilityRole="button" accessibilityLabel="इस अनुरोध में मदद करें" onPress={onOffer} style={styles.offerButton}><MaterialCommunityIcons name="account-heart-outline" size={19} color="#FFFFFF" /><Text style={styles.offerButtonText}>मैं मदद कर सकती हूं</Text></Pressable>}</View>;
}

function EmptyState({ tab, onStory, onHelp, styles }) {
  const isStories = tab === 'stories';
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><MaterialCommunityIcons name={isStories ? 'text-box-plus-outline' : 'hand-heart-outline'} size={42} color={COLORS.secondary[800]} /></View><Text style={styles.emptyTitle}>{isStories ? 'अभी कोई कहानी नहीं है' : 'अभी कोई मदद का अनुरोध नहीं है'}</Text><Text style={styles.emptyText}>{isStories ? 'अपना अनुभव साझा करके किसी और को आगे बढ़ने की प्रेरणा दें।' : 'आपको किसी विषय में मदद चाहिए तो यहां लिख सकती हैं।'}</Text><Pressable onPress={isStories ? onStory : onHelp} style={styles.emptyAction}><Text style={styles.emptyActionText}>{isStories ? 'पहली कहानी साझा करें' : 'मदद मांगें'}</Text></Pressable></View>;
}

function StoryForm({ visible, onClose, onSubmit, styles }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(STORY_CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => { setSubmitting(true); try { await onSubmit({ title, content, category }); setTitle(''); setContent(''); setCategory(STORY_CATEGORIES[0]); } catch {} finally { setSubmitting(false); } };
  return <CommunityModal visible={visible} title="अपनी कहानी साझा करें" icon="text-box-check-outline" onClose={onClose} styles={styles}><Text style={styles.formHint}>कृपया फोन नंबर, OTP, लिंक या निजी पता न लिखें।</Text><Text style={styles.formLabel}>शीर्षक</Text><TextInput accessibilityLabel="कहानी का शीर्षक" value={title} onChangeText={setTitle} placeholder="मैंने क्या सीखा" placeholderTextColor={COLORS.text.tertiary} style={styles.input} maxLength={100} /><Text style={styles.formLabel}>अपनी कहानी</Text><TextInput accessibilityLabel="अपनी कहानी" value={content} onChangeText={setContent} placeholder="बताएं कि इससे आपको क्या मदद मिली" placeholderTextColor={COLORS.text.tertiary} style={[styles.input, styles.textArea]} multiline maxLength={900} /><CategoryPicker options={STORY_CATEGORIES} selected={category} onSelect={setCategory} styles={styles} /><SubmitButton label="कहानी साझा करें" submitting={submitting} onPress={submit} styles={styles} /></CommunityModal>;
}

function HelpForm({ visible, onClose, onSubmit, styles }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(HELP_CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => { setSubmitting(true); try { await onSubmit({ title, description, category }); setTitle(''); setDescription(''); setCategory(HELP_CATEGORIES[0]); } catch {} finally { setSubmitting(false); } };
  return <CommunityModal visible={visible} title="मदद मांगें" icon="hand-heart-outline" onClose={onClose} styles={styles}><Text style={styles.formHint}>अपनी समस्या लिखें, लेकिन फोन नंबर, OTP, लिंक या निजी पता साझा न करें।</Text><Text style={styles.formLabel}>मदद का विषय</Text><TextInput accessibilityLabel="मदद का विषय" value={title} onChangeText={setTitle} placeholder="जैसे: UPI से भुगतान कैसे करें?" placeholderTextColor={COLORS.text.tertiary} style={styles.input} maxLength={100} /><Text style={styles.formLabel}>थोड़ा विस्तार से बताएं</Text><TextInput accessibilityLabel="मदद की जानकारी" value={description} onChangeText={setDescription} placeholder="आपको किस बात में मदद चाहिए?" placeholderTextColor={COLORS.text.tertiary} style={[styles.input, styles.textArea]} multiline maxLength={700} /><CategoryPicker options={HELP_CATEGORIES} selected={category} onSelect={setCategory} styles={styles} /><SubmitButton label="मदद का अनुरोध भेजें" submitting={submitting} onPress={submit} styles={styles} /></CommunityModal>;
}

function OfferForm({ request, onClose, onSubmit, styles }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => { setSubmitting(true); try { await onSubmit(message); setMessage(''); } catch {} finally { setSubmitting(false); } };
  return <CommunityModal visible={Boolean(request)} title="मदद का संदेश भेजें" icon="account-heart-outline" onClose={onClose} styles={styles}><Text style={styles.formHint}>मदद का छोटा संदेश लिखें। निजी संपर्क जानकारी साझा न करें।</Text><TextInput accessibilityLabel="मदद का संदेश" value={message} onChangeText={setMessage} placeholder="मैं इस विषय में आपकी मदद कर सकती हूं..." placeholderTextColor={COLORS.text.tertiary} style={[styles.input, styles.textArea]} multiline maxLength={400} /><SubmitButton label="संदेश भेजें" submitting={submitting} onPress={submit} styles={styles} /></CommunityModal>;
}

function CommunityModal({ visible, title, icon, onClose, children, styles }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View accessibilityViewIsModal style={styles.modalCard}><View style={styles.modalHeader}><View style={styles.modalTitleRow}><View style={styles.modalIcon}><MaterialCommunityIcons name={icon} size={23} color={COLORS.primary[800]} /></View><Text style={styles.modalTitle}>{title}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="फॉर्म बंद करें" onPress={onClose} style={styles.closeButton}><MaterialCommunityIcons name="close" size={21} color={COLORS.text.primary} /></Pressable></View><ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView></View></View></Modal>;
}

function CategoryPicker({ options, selected, onSelect, styles }) {
  return <><Text style={styles.formLabel}>श्रेणी</Text><View style={styles.categories}>{options.map((option) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected: selected === option }} onPress={() => onSelect(option)} style={[styles.categoryOption, selected === option && styles.categoryOptionActive]}><Text style={[styles.categoryOptionText, selected === option && styles.categoryOptionTextActive]}>{option}</Text></Pressable>)}</View></>;
}

function SubmitButton({ label, submitting, onPress, styles }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={submitting} onPress={onPress} style={[styles.submitButton, submitting && styles.disabled]}><Text style={styles.submitButtonText}>{submitting ? 'भेजा जा रहा है...' : label}</Text></Pressable>;
}

function createStyles(scaleText) {
  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    headerCopy: { flex: 1, paddingRight: SPACING.sm },
    headerTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']) },
    headerSubtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(20), marginTop: 1 },
    listenButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: COLORS.accent[100] },
    safetyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, padding: SPACING.sm, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.secondary[50], borderWidth: 1, borderColor: COLORS.secondary[100] },
    safetyText: { flex: 1, color: COLORS.secondary[900], fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(19) },
    quickActions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
    quickAction: { flex: 1, minHeight: 76, alignItems: 'center', justifyContent: 'center', gap: 5, padding: SPACING.xs, borderRadius: BORDER_RADIUS.xl, borderWidth: 1 },
    helpAction: { backgroundColor: COLORS.secondary[50], borderColor: COLORS.secondary[200] },
    storyAction: { backgroundColor: COLORS.primary[50], borderColor: COLORS.primary[200] },
    quickActionText: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), textAlign: 'center' },
    tabs: { flexDirection: 'row', padding: 4, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    tabButton: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: BORDER_RADIUS.sm },
    activeTabButton: { backgroundColor: COLORS.primary[600] },
    tabText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), textAlign: 'center' },
    activeTabText: { color: '#FFFFFF' },
    listContent: { paddingBottom: SPACING['2xl'] },
    loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    loadingText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(14) },
    errorCard: { alignItems: 'center', padding: SPACING.lg, marginTop: SPACING.lg, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F5B8B8' },
    errorTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg), textAlign: 'center', marginTop: SPACING.sm },
    errorText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(19), textAlign: 'center', marginTop: 3 },
    retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.status.error },
    retryButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    emptyState: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.lg, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    emptyIcon: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center', borderRadius: 42, backgroundColor: COLORS.secondary[100], marginBottom: SPACING.sm },
    emptyTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg), textAlign: 'center' },
    emptyText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(21), textAlign: 'center', marginTop: 4 },
    emptyAction: { minHeight: 46, justifyContent: 'center', paddingHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary[600] },
    emptyActionText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    itemCard: { padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
    itemTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
    authorCircle: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, marginRight: SPACING.xs, backgroundColor: COLORS.primary[100] },
    helpAvatar: { backgroundColor: COLORS.secondary[100] },
    authorInitial: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(17) },
    itemTopCopy: { flex: 1, minWidth: 0 },
    authorName: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    itemTime: { color: COLORS.text.tertiary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), marginTop: 1 },
    reportButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
    categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginBottom: SPACING.xs, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.primary[100] },
    helpCategoryPill: { backgroundColor: COLORS.secondary[100] },
    categoryText: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.xs) },
    helpCategoryText: { color: COLORS.secondary[800] },
    itemTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(25) },
    itemContent: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), lineHeight: scaleText(21), marginTop: 3 },
    offerButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.secondary[700] },
    offerButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
    modalCard: { maxHeight: '88%', padding: SPACING.md, borderTopLeftRadius: BORDER_RADIUS['2xl'], borderTopRightRadius: BORDER_RADIUS['2xl'], backgroundColor: COLORS.background.primary },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
    modalTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    modalIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, marginRight: SPACING.xs, backgroundColor: COLORS.primary[100] },
    modalTitle: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg) },
    closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.neutral.gray[100] },
    formHint: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.xs), lineHeight: scaleText(19), padding: SPACING.sm, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.secondary[50] },
    formLabel: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), marginBottom: 5 },
    input: { minHeight: 50, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, marginBottom: SPACING.sm, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(14), borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: '#FFFFFF' },
    textArea: { minHeight: 116, textAlignVertical: 'top' },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
    categoryOption: { minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFFFFF' },
    categoryOptionActive: { backgroundColor: COLORS.primary[100], borderColor: COLORS.primary[500] },
    categoryOptionText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(TYPOGRAPHY.fontSize.xs) },
    categoryOptionTextActive: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold },
    submitButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xs, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary[700] },
    submitButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(14) },
    disabled: { opacity: 0.65 },
  });
}
