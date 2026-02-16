import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

const { width } = Dimensions.get('window');

export default function AuthSignUpScreen({ navigation }) {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = async () => {
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            setError('कृपया सभी जानकारी भरें');
            return;
        }

        if (password !== confirmPassword) {
            setError('पासवर्ड मेल नहीं खा रहे हैं');
            return;
        }

        if (password.length < 6) {
            setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await signUp(name, email, password);
            // AuthGate will handle navigation
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('यह ईमेल पहले से पंजीकृत है');
            } else if (err.code === 'auth/invalid-email') {
                setError('कृपया सही ईमेल लिखें');
            } else if (err.code === 'auth/weak-password') {
                setError('पासवर्ड बहुत कमजोर है');
            } else {
                setError('खाता बनाने में समस्या आई। कृपया फिर से कोशिश करें');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.primary[50], COLORS.neutral.white]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary[700]} />
                        </Pressable>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="account-plus" size={48} color={COLORS.primary[600]} />
                        </View>
                        <Text style={styles.appName}>सखी</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>नया खाता बनाएं</Text>
                        <Text style={styles.subtitle}>सखी से जुड़ने के लिए विवरण भरें</Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.status.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>नाम (Name)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-outline" size={24} color={COLORS.neutral.gray[500]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="अपना नाम लिखें"
                                    placeholderTextColor={COLORS.neutral.gray[400]}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ईमेल (Email)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-outline" size={24} color={COLORS.neutral.gray[500]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor={COLORS.neutral.gray[400]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>पासवर्ड (Password)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-outline" size={24} color={COLORS.neutral.gray[500]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="पासवर्ड चुनें"
                                    placeholderTextColor={COLORS.neutral.gray[400]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialCommunityIcons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={24}
                                        color={COLORS.neutral.gray[500]}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>पासवर्ड दोहराएं (Confirm)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-check-outline" size={24} color={COLORS.neutral.gray[500]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="वही पासवर्ड फिर से लिखें"
                                    placeholderTextColor={COLORS.neutral.gray[400]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                pressed && { opacity: 0.9 },
                                loading && { opacity: 0.7 }
                            ]}
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[COLORS.primary[600], COLORS.primary[500]]}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>साइन अप करें</Text>
                                )}
                            </LinearGradient>
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>पहले से खाता है?</Text>
                            <Pressable onPress={() => navigation.navigate('SignIn')}>
                                <Text style={styles.footerLink}>लॉगिन करें</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
        paddingTop: SPACING.xl,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        marginTop: SPACING.xl,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 15,
        padding: 10,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.neutral.white,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.primary[100],
        shadowColor: COLORS.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary[700],
    },
    formContainer: {
        backgroundColor: COLORS.neutral.white,
        padding: SPACING.xl, // Reverted to xl for wider inputs
        borderRadius: BORDER_RADIUS['2xl'],
        shadowColor: COLORS.primary[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.neutral.gray[900],
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.neutral.gray[600],
        marginBottom: SPACING['2xl'],
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.status.error + '15',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.status.error + '30',
    },
    errorText: {
        color: COLORS.status.error,
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral.gray[800],
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5, // Thicker border
        borderColor: COLORS.neutral.gray[200],
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.neutral.white,
        height: 60, // Increased height
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    inputIcon: {
        paddingHorizontal: SPACING.lg,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: COLORS.neutral.gray[900],
        fontWeight: '500',
    },
    eyeIcon: {
        paddingHorizontal: SPACING.lg,
        height: '100%',
        justifyContent: 'center',
    },
    button: {
        marginTop: SPACING.lg,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING['2xl'],
        gap: 8,
    },
    footerText: {
        color: COLORS.neutral.gray[600],
        fontSize: 15,
        fontWeight: '500',
    },
    footerLink: {
        color: COLORS.primary[600],
        fontSize: 15,
        fontWeight: 'bold',
    },
});
