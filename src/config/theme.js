// Sakhi Design System — Marigold Gold + Warm Teal
// Inspired by Indian marigold flowers, designed for warmth and trust
export const COLORS = {
  // Primary palette - Marigold Gold (Festive, Warm, Indian)
  primary: {
    50: '#FFF8E7',
    100: '#FFEFC2',
    200: '#FFE099',
    300: '#FFD06B',
    400: '#FFC043',
    500: '#F5A623', // Marigold gold - India's color, festive, trustworthy
    600: '#D48E1C',
    700: '#B37615',
    800: '#8C5C10',
    900: '#66430C',
  },

  // Secondary - Soft Teal (Calming, Modern, Trust)
  secondary: {
    50: '#F0FDFB',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#4ECDC4', // Soft teal - calming, pairs beautifully with gold
    500: '#2DD4BF',
    600: '#14B8A6',
    700: '#0D9488',
    800: '#0F766E',
    900: '#115E59',
  },

  // Accent - Deep Plum (Richness, Femininity, Cultural depth)
  accent: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#A855F7',
    500: '#8B5CF6', // Rich purple - elegant, feminine
    600: '#7C3AED',
    700: '#6C3483',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Background - Warm cream tones
  background: {
    primary: '#FFF9F0', // Warm cream
    secondary: '#FFFFFF',
    card: '#FFFFFF',
    surface: '#FFF5E8', // Subtle warm surface
    call: '#0D2B2E', // Dark teal-black for phone call mood
  },

  // Text colors - High contrast with warmth
  text: {
    primary: '#2C2420', // Warm dark brown
    secondary: '#6B5D52', // Medium warm brown
    tertiary: '#9B8B7E',
    inverse: '#FFFFFF',
  },

  // Neutral colors - Warm grays
  neutral: {
    white: '#FFFFFF',
    black: '#2C2420',
    gray: {
      50: '#FAFAF9',
      100: '#F5F4F2',
      200: '#E8E6E3',
      300: '#D6D2CD',
      400: '#B0A99F',
      500: '#8A8078',
      600: '#6B5D52',
      700: '#544840',
      800: '#3E352F',
      900: '#2C2420',
    }
  },

  // Status colors - Vibrant and clear
  status: {
    success: '#10B981', // Green for success
    warning: '#F59E0B', // Amber for warnings
    error: '#EF4444',   // Red for errors
    info: '#3B82F6',    // Blue for info
  },

  // UI specific
  border: '#E8E6E3',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'NotoSansDevanagari-Regular',
    medium: 'NotoSansDevanagari-Medium',
    semibold: 'NotoSansDevanagari-SemiBold',
    bold: 'NotoSansDevanagari-Bold',
    hindi: 'NotoSansDevanagari-Regular',
  },

  fontSize: {
    xs: 14,   // Increased from 12 for readability
    sm: 16,   // Increased from 14
    base: 18, // Increased from 16 - better for low-literacy users
    lg: 22,   // Increased from 18
    xl: 26,   // Increased from 20
    '2xl': 32, // Increased from 24 - better for CTAs
    '3xl': 40, // Increased from 30 - hero text
    '4xl': 48, // Increased from 36 - massive CTAs
    '5xl': 56, // New - for hero voice button
  },

  lineHeight: {
    tight: 1.3,
    normal: 1.6,  // Increased from 1.5 for better readability
    relaxed: 1.8, // Increased from 1.75
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  }
};

export const SPACING = {
  xs: 8,    // Increased from 4
  sm: 12,   // Increased from 8
  md: 20,   // Increased from 16 - more breathing room
  lg: 32,   // Increased from 24
  xl: 48,   // Increased from 32
  '2xl': 64, // Increased from 48
  '3xl': 96, // Increased from 64
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  }
};

// Cultural patterns and decorative elements
export const PATTERNS = {
  mandala: '🪷',
  lotus: '🪷',
  diya: '🪔',
  flower: '🌸',
  star: '⭐',
  heart: '💖',
  sparkle: '✨',
  celebration: '🎉',
};

// Motivational messages in Hindi/English
export const MOTIVATIONAL_MESSAGES = [
  'आप बहुत अच्छा कर रही हैं! 🌟',
  'शाबाश! आगे बढ़ते रहिए! 💪',
  'You are doing amazing! 🎉',
  'हर दिन कुछ नया सीखना बहुत अच्छी बात है! 📚',
  'आपकी मेहनत रंग लाएगी! 🌈',
  'Keep learning, keep growing! 🌱',
  'आप एक सुपरस्टार हैं! ⭐',
  'Knowledge is power! 💡',
];

// Festival greetings
export const FESTIVAL_GREETINGS = {
  diwali: 'दिवाली की शुभकामनाएं! 🪔✨',
  holi: 'होली की बधाई! 🌈🎨',
  dussehra: 'दशहरा की शुभकामनाएं! 🏹',
  karva_chauth: 'करवा चौथ की शुभकामनाएं! 🌙',
  raksha_bandhan: 'रक्षा बंधन की शुभकामनाएं! 👫',
  navratri: 'नवरात्रि की शुभकामनाएं! 💃',
};

// Create a unified theme object for easier access
export const theme = {
  colors: {
    primary: COLORS.primary[500],
    secondary: COLORS.secondary[500],
    accent: COLORS.accent[500],
    background: COLORS.background.primary,
    surface: COLORS.background.surface,
    text: COLORS.text.primary,
    textSecondary: COLORS.text.secondary,
    border: COLORS.border,
    shadow: COLORS.shadow,
    success: COLORS.status.success,
    warning: COLORS.status.warning,
    error: COLORS.status.error,
    info: COLORS.status.info,
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  PATTERNS,
  MOTIVATIONAL_MESSAGES,
  FESTIVAL_GREETINGS,
  theme,
};
