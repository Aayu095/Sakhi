import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';

export default function SignOutConfirmation({ visible, busy, error, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={busy ? undefined : onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="साइन आउट पुष्टि बंद करें" disabled={busy} onPress={onCancel} style={styles.backdrop} />
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.iconCircle}><MaterialCommunityIcons name="logout" size={29} color={COLORS.status.error} /></View>
          <Text style={styles.title}>साइन आउट करें?</Text>
          <Text style={styles.description}>आप बाद में फिर से साइन इन कर सकती हैं।</Text>
          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={onCancel} style={[styles.cancelButton, busy && styles.disabled]}>
              <Text style={styles.cancelText}>रुकें</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={onConfirm} style={[styles.confirmButton, busy && styles.disabled]}>
              <Text style={styles.confirmText}>{busy ? 'साइन आउट हो रहा है...' : 'साइन आउट'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.md },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  card: { width: '100%', maxWidth: 380, alignItems: 'center', padding: SPACING.lg, borderRadius: BORDER_RADIUS['2xl'], backgroundColor: COLORS.background.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 20, elevation: 12 },
  iconCircle: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, marginBottom: SPACING.sm, backgroundColor: '#FFF0F0' },
  title: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.lg, textAlign: 'center' },
  description: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25, textAlign: 'center', marginTop: 4 },
  errorText: { width: '100%', color: '#A52A2A', fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.fontSize.xs, lineHeight: 22, textAlign: 'center', padding: SPACING.sm, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: '#FFF0F0' },
  actions: { width: '100%', flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  cancelButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFFFFF' },
  cancelText: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  confirmButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.status.error },
  confirmText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  disabled: { opacity: 0.6 },
});
