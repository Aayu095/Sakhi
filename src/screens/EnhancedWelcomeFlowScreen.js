import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';

const { width } = Dimensions.get('window');

const STEPS = [
    {
        id: 'intro',
        title: 'नमस्ते!',
        subtitle: 'मैं आपकी सखी हूं।',
        description: 'मैं आपके स्वास्थ्य और डिजिटल दुनिया को समझने में आपकी मदद करूंगी।',
        icon: 'hand-wave',
        color: COLORS.primary[500],
        buttonText: 'आगे बढ़ें'
    },
    {
        id: 'voice',
        title: 'बोलकर बात करें',
        subtitle: 'लिखने की जरूरत नहीं',
        description: 'आप मुझसे अपनी भाषा में बोलकर कोई भी सवाल पूछ सकती हैं।',
        icon: 'microphone',
        color: '#10B981',
        buttonText: 'समझ गई'
    },
    {
        id: 'privacy',
        title: 'पूरी तरह सुरक्षित',
        subtitle: 'आपकी बातें गुप्त रहेंगी',
        description: 'आप बेझिझक मुझसे अपने मन की बात कह सकती हैं।',
        icon: 'shield-check',
        color: '#8B5CF6',
        buttonText: 'शुरू करें'
    }
];

export default function EnhancedWelcomeFlowScreen() {
    const { updateUserProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete welcome flow
            try {
                await updateUserProfile({ welcomeCompleted: true });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
                console.error('Error completing welcome flow:', error);
            }
        }
    };

    // Simulate Didi speaking when step changes
    useEffect(() => {
        setIsSpeaking(true);
        const timer = setTimeout(() => {
            setIsSpeaking(false);
        }, 2000); // Speak for 2 seconds on each step
        return () => clearTimeout(timer);
    }, [currentStep]);

    const stepData = STEPS[currentStep];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={[COLORS.primary[50], COLORS.neutral.white]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView contentContainerStyle={styles.contentContainer}>

                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            {STEPS.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.progressDot,
                                        {
                                            backgroundColor: index === currentStep
                                                ? stepData.color
                                                : index < currentStep
                                                    ? stepData.color
                                                    : COLORS.neutral.gray[300],
                                            width: index === currentStep ? 32 : 10, // Larger active dot
                                            opacity: index <= currentStep ? 1 : 0.4
                                        }
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Avatar Section */}
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <AnimatedDidiAvatar
                                    size={200} // Increased size as requested
                                    isSpeaking={isSpeaking}
                                    emotion={currentStep === 0 ? 'welcoming' : 'neutral'}
                                    variant="circle"
                                />
                            </View>
                        </View>

                        {/* Content Card */}
                        <View style={styles.cardContainer}>
                            <View style={[styles.iconBadge, { backgroundColor: stepData.color + '15' }]}>
                                <MaterialCommunityIcons name={stepData.icon} size={40} color={stepData.color} />
                            </View>

                            <Text style={styles.title}>{stepData.title}</Text>
                            <Text style={[styles.subtitle, { color: stepData.color }]}>{stepData.subtitle}</Text>

                            <Text style={styles.description}>
                                {stepData.description}
                            </Text>
                        </View>

                    </ScrollView>

                    {/* Bottom Button */}
                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: stepData.color },
                                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={handleNext}
                        >
                            <Text style={styles.buttonText}>{stepData.buttonText}</Text>
                            <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral.white,
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: SPACING.xl, // Reduced from 3xl
        paddingHorizontal: SPACING.lg,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.xl, // Reduced from 3xl
        height: 12,
        alignItems: 'center',
    },
    progressDot: {
        height: 8,
        borderRadius: 4,
    },
    avatarSection: {
        marginBottom: SPACING.xl, // Reduced from 3xl
        alignItems: 'center',
    },
    avatarContainer: {
        padding: SPACING.sm, // Reduced from md
        backgroundColor: COLORS.neutral.white,
        borderRadius: BORDER_RADIUS.full,
        shadowColor: COLORS.primary[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: COLORS.neutral.white,
        borderRadius: BORDER_RADIUS['2xl'], // Slightly less rounded
        padding: SPACING.xl, // Reduced from 2xl
        paddingVertical: SPACING.xl, // Reduced from 3xl
        shadowColor: COLORS.primary[900],
        shadowOffset: { width: 0, height: 8 }, // Reduced shadow
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
        marginBottom: SPACING.lg, // Reduced from 3xl
    },
    iconBadge: {
        width: 64, // Reduced from 80
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg, // Reduced from xl
    },
    title: {
        fontSize: 26, // Reduced from 30
        fontWeight: 'bold',
        color: COLORS.neutral.gray[900],
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16, // Reduced from 18
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: SPACING.md, // Reduced from xl
    },
    description: {
        fontSize: 15, // Reduced from 17
        color: COLORS.neutral.gray[600],
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: SPACING.sm,
    },
    footer: {
        padding: SPACING.lg, // Reduced from xl
        paddingBottom: SPACING.xl, // Reduced from 3xl
    },
    button: {
        width: '100%',
        height: 56, // Reduced from 64
        borderRadius: BORDER_RADIUS.full,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18, // Reduced from 20
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
