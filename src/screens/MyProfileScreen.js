import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccessibility, TEXT_SIZE_OPTIONS } from '../hooks/useAccessibility';
import { useAuth } from '../providers/AuthProvider';
import SignOutConfirmation from '../components/SignOutConfirmation';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';

const LEARNING_GOALS = ['डिजिटल साक्षरता', 'स्वास्थ्य', 'पढ़ना-लिखना', 'वित्तीय जानकारी'];
const INTERESTS = ['सरकारी योजनाएं', 'ऑनलाइन सुरक्षा', 'काम-कौशल', 'परिवार की सेहत'];

function toggleOption(options, option) {
  return options.includes(option)
    ? options.filter((item) => item !== option)
    : [...options, option];
}

export default function MyProfileScreen() {
  const { profile, updateName, updateUserProfile, signOut } = useAuth();
  const { settings, scaleText, speak, stopSpeaking, updateAccessibility } = useAccessibility();
  const [name, setName] = useState(profile?.name || '');
  const [language, setLanguage] = useState(profile?.language || 'hi-IN');
  const [stateName, setStateName] = useState(profile?.location?.state || profile?.state || '');
  const [district, setDistrict] = useState(profile?.location?.district || profile?.district || '');
  const [learningGoals, setLearningGoals] = useState(profile?.learningGoals || []);
  const [interests, setInterests] = useState(profile?.interests || []);
  const [busy, setBusy] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const styles = useMemo(() => createStyles(scaleText), [scaleText]);

  useEffect(() => {
    setName(profile?.name || '');
    setLanguage(profile?.language || 'hi-IN');
    setStateName(profile?.location?.state || profile?.state || '');
    setDistrict(profile?.location?.district || profile?.district || '');
    setLearningGoals(profile?.learningGoals || []);
    setInterests(profile?.interests || []);
  }, [profile?.uid]);

  const readProfilePage = () => {
    const location = [district, stateName].filter(Boolean).join(', ');
    const goalText = learningGoals.length ? learningGoals.join(', ') : 'अभी कोई सीखने का विषय नहीं चुना है';
    speak(`यह आपकी प्रोफाइल है। नाम ${name || 'नहीं भरा गया है'}। ${location ? `स्थान ${location}।` : ''} आपके सीखने के विषय हैं: ${goalText}।`);
  };

  const saveProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('नाम लिखें', 'प्रोफाइल सेव करने से पहले अपना नाम लिखें।');
      return;
    }

    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (trimmedName !== profile?.name) {
        await updateName(trimmedName);
      }
      await updateUserProfile({
        language,
        location: { state: stateName.trim(), district: district.trim() },
        learningGoals,
        interests,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('सेव हो गया', 'आपकी प्रोफाइल और पसंद सुरक्षित कर दी गई हैं।');
    } catch (error) {
      Alert.alert('सेव नहीं हो पाया', error?.message || 'कृपया फिर से कोशिश करें।');
    } finally {
      setBusy(false);
    }
  };

  const handleTextSize = async (textSize) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateAccessibility({ textSize });
  };

  const handleAccessibilityToggle = async (key, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateAccessibility({ [key]: value });
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(name || 'स').charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.title}>मेरी प्रोफाइल</Text>
          <Text style={styles.subtitle}>अपनी पसंद के हिसाब से सखी को बेहतर बनाएं</Text>
        </View>

        <View style={styles.sectionCard}>
          <SectionHeading icon="account-outline" title="आपकी जानकारी" styles={styles} />
          <Text style={styles.fieldLabel}>नाम</Text>
          <TextInput
            accessibilityLabel="आपका नाम"
            value={name}
            onChangeText={setName}
            placeholder="अपना नाम लिखें"
            placeholderTextColor={COLORS.text.tertiary}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>भाषा</Text>
          <View style={styles.choiceRow}>
            <ChoiceButton label="हिंदी" selected={language === 'hi-IN'} onPress={() => setLanguage('hi-IN')} styles={styles} />
            <ChoiceButton label="English" selected={language === 'en-IN'} onPress={() => setLanguage('en-IN')} styles={styles} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <SectionHeading icon="map-marker-outline" title="आपका क्षेत्र" styles={styles} />
          <Text style={styles.fieldHint}>यह जानकारी आपकी पसंद के हिसाब से सुझाव देने के लिए है। इसे Community में अपने-आप साझा नहीं किया जाएगा।</Text>
          <Text style={styles.fieldLabel}>राज्य</Text>
          <TextInput accessibilityLabel="आपका राज्य" value={stateName} onChangeText={setStateName} placeholder="जैसे: उत्तर प्रदेश" placeholderTextColor={COLORS.text.tertiary} style={styles.input} />
          <Text style={styles.fieldLabel}>जिला</Text>
          <TextInput accessibilityLabel="आपका जिला" value={district} onChangeText={setDistrict} placeholder="जैसे: लखनऊ" placeholderTextColor={COLORS.text.tertiary} style={styles.input} />
        </View>

        <View style={styles.sectionCard}>
          <SectionHeading icon="target" title="आप क्या सीखना चाहती हैं?" styles={styles} />
          <Text style={styles.fieldHint}>एक या एक से ज्यादा विषय चुनें।</Text>
          <OptionChips options={LEARNING_GOALS} selectedOptions={learningGoals} onToggle={(option) => setLearningGoals((current) => toggleOption(current, option))} styles={styles} />
          <Text style={[styles.fieldLabel, styles.secondLabel]}>आपकी रुचियां</Text>
          <OptionChips options={INTERESTS} selectedOptions={interests} onToggle={(option) => setInterests((current) => toggleOption(current, option))} styles={styles} />
        </View>

        <View style={styles.sectionCard}>
          <SectionHeading icon="accessibility" title="पढ़ने और सुनने की सुविधा" styles={styles} />
          <Text style={styles.fieldHint}>ये विकल्प आपके खाते में सेव रहेंगे।</Text>

          <View style={styles.readAloudRow}>
            <View style={styles.readAloudCopy}>
              <Text style={styles.preferenceTitle}>यह पेज सुनें</Text>
              <Text style={styles.preferenceDescription}>लिखी हुई जानकारी को आवाज़ में सुनें</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="प्रोफाइल पेज सुनें" onPress={readProfilePage} style={styles.listenButton}>
              <MaterialCommunityIcons name="volume-high" size={20} color={COLORS.accent[800]} />
              <Text style={styles.listenButtonText}>सुनें</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="बोलना रोकें" onPress={stopSpeaking} style={styles.stopButton}>
            <MaterialCommunityIcons name="stop-circle-outline" size={19} color={COLORS.text.secondary} />
            <Text style={styles.stopButtonText}>आवाज़ रोकें</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>अक्षर का आकार</Text>
          <View style={styles.textSizeRow}>
            {TEXT_SIZE_OPTIONS.map((option) => (
              <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={`${option.label} अक्षर`} accessibilityState={{ selected: settings.textSize === option.id }} onPress={() => handleTextSize(option.id)} style={[styles.textSizeOption, settings.textSize === option.id && styles.textSizeOptionActive]}>
                <Text style={[styles.textSizeOptionText, settings.textSize === option.id && styles.textSizeOptionTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <PreferenceSwitch icon="volume-variant" title="स्क्रीन की जानकारी सुनें" subtitle="मुख्य पेजों की जानकारी आवाज़ में सुनें" value={settings.readAloud} onValueChange={(value) => handleAccessibilityToggle('readAloud', value)} styles={styles} />
          <PreferenceSwitch icon="speedometer-slow" title="धीरे बोलें" subtitle="आवाज़ की गति कम रखें" value={settings.slowSpeech} onValueChange={(value) => handleAccessibilityToggle('slowSpeech', value)} styles={styles} />
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="प्रोफाइल सेव करें" onPress={saveProfile} disabled={busy} style={[styles.saveButton, busy && styles.disabled]}>
          <MaterialCommunityIcons name={busy ? 'content-save-cog' : 'content-save-outline'} size={22} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{busy ? 'सेव हो रहा है...' : 'प्रोफाइल सेव करें'}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel="साइन आउट" onPress={handleSignOut} style={styles.signOutButton}>
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.status.error} />
          <Text style={styles.signOutText}>साइन आउट</Text>
        </Pressable>
      </ScrollView>

      <SignOutConfirmation
        visible={showSignOutConfirm}
        busy={isSigningOut}
        error={signOutError}
        onCancel={cancelSignOut}
        onConfirm={confirmSignOut}
      />
    </View>
  );
}

function SectionHeading({ icon, title, styles }) {
  return <View style={styles.sectionHeading}><View style={styles.sectionIcon}><MaterialCommunityIcons name={icon} size={22} color={COLORS.primary[800]} /></View><Text style={styles.sectionTitle}>{title}</Text></View>;
}

function ChoiceButton({ label, selected, onPress, styles }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.choiceButton, selected && styles.choiceButtonActive]}><Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{label}</Text></Pressable>;
}

function OptionChips({ options, selectedOptions, onToggle, styles }) {
  return <View style={styles.chips}>{options.map((option) => { const selected = selectedOptions.includes(option); return <Pressable key={option} accessibilityRole="checkbox" accessibilityLabel={option} accessibilityState={{ checked: selected }} onPress={() => onToggle(option)} style={[styles.chip, selected && styles.chipSelected]}><MaterialCommunityIcons name={selected ? 'check-circle' : 'circle-outline'} size={18} color={selected ? COLORS.secondary[800] : COLORS.text.tertiary} /><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text></Pressable>; })}</View>;
}

function PreferenceSwitch({ icon, title, subtitle, value, onValueChange, styles }) {
  return <View style={styles.preferenceRow}><View style={styles.preferenceIcon}><MaterialCommunityIcons name={icon} size={21} color={COLORS.secondary[800]} /></View><View style={styles.preferenceCopy}><Text style={styles.preferenceTitle}>{title}</Text><Text style={styles.preferenceDescription}>{subtitle}</Text></View><Switch accessibilityLabel={title} value={value} onValueChange={onValueChange} trackColor={{ false: COLORS.neutral.gray[300], true: COLORS.secondary[400] }} thumbColor={value ? COLORS.secondary[800] : COLORS.neutral.white} /></View>;
}

function createStyles(scaleText) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background.primary },
    content: { padding: SPACING.md, paddingBottom: SPACING['2xl'] },
    hero: { alignItems: 'center', paddingVertical: SPACING.md, marginBottom: SPACING.sm },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary[500], borderWidth: 4, borderColor: COLORS.primary[100] },
    avatarText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']) },
    title: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']), marginTop: SPACING.sm },
    subtitle: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), textAlign: 'center', lineHeight: scaleText(25), marginTop: 2 },
    sectionCard: { padding: SPACING.md, marginBottom: SPACING.sm, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.xl },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    sectionIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.xs, backgroundColor: COLORS.primary[100] },
    sectionTitle: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.lg), lineHeight: scaleText(30) },
    fieldLabel: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), marginTop: SPACING.sm, marginBottom: 6 },
    secondLabel: { marginTop: SPACING.md },
    fieldHint: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(12), lineHeight: scaleText(19), marginBottom: SPACING.xs },
    input: { minHeight: 52, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(TYPOGRAPHY.fontSize.sm), backgroundColor: COLORS.background.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md },
    choiceRow: { flexDirection: 'row', gap: SPACING.sm },
    choiceButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.background.surface },
    choiceButtonActive: { borderColor: COLORS.primary[600], backgroundColor: COLORS.primary[100] },
    choiceText: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    choiceTextActive: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    chip: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.background.surface, borderWidth: 1, borderColor: COLORS.border },
    chipSelected: { backgroundColor: COLORS.secondary[50], borderColor: COLORS.secondary[400] },
    chipText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(12) },
    chipTextSelected: { color: COLORS.secondary[800], fontFamily: TYPOGRAPHY.fontFamily.bold },
    readAloudRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, marginTop: SPACING.xs, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.accent[50] },
    readAloudCopy: { flex: 1, paddingRight: SPACING.xs },
    listenButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.accent[100] },
    listenButtonText: { color: COLORS.accent[800], fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(12) },
    stopButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: SPACING.xs },
    stopButtonText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(12) },
    textSizeRow: { flexDirection: 'row', gap: SPACING.xs },
    textSizeOption: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background.surface },
    textSizeOptionActive: { backgroundColor: COLORS.primary[100], borderColor: COLORS.primary[600] },
    textSizeOptionText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: scaleText(12) },
    textSizeOptionTextActive: { color: COLORS.primary[800], fontFamily: TYPOGRAPHY.fontFamily.bold },
    preferenceRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.sm },
    preferenceIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, marginRight: SPACING.xs, backgroundColor: COLORS.secondary[100] },
    preferenceCopy: { flex: 1, paddingRight: SPACING.xs },
    preferenceTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(14) },
    preferenceDescription: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: scaleText(11), lineHeight: scaleText(18), marginTop: 1 },
    saveButton: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.xl, backgroundColor: COLORS.primary[700] },
    saveButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(TYPOGRAPHY.fontSize.sm) },
    disabled: { opacity: 0.65 },
    signOutButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: '#FFF0F0' },
    signOutText: { color: COLORS.status.error, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: scaleText(14) },
  });
}
