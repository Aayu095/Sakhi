// Icon mapping utility for Sakhi
// Maps emoji icons to MaterialCommunityIcons names

export const ICON_MAP = {
    // Main Navigation Icons
    'microphone': 'microphone-message',
    'video': 'video-vintage',
    'book': 'book-open-page-variant',
    'chart': 'chart-line',
    'community': 'account-group',
    'volume': 'volume-high',

    // Health & Medical
    'hospital': 'hospital-box',
    'medical': 'medical-bag',
    'heart': 'heart-pulse',
    'medicine': 'pill',
    'vaccine': 'needle',
    'herbal': 'leaf',
    'pregnancy': 'human-pregnant',
    'baby': 'baby-face',
    'menstrual': 'water-circle',

    // Digital & Technology
    'phone': 'cellphone',
    'smartphone': 'cellphone-check',
    'payment': 'credit-card',
    'message': 'message-text',
    'lock': 'lock',
    'government': 'bank',
    'computer': 'laptop',

    // Progress & Achievement
    'trophy': 'trophy',
    'crown': 'crown',
    'star': 'star',
    'fire': 'fire',
    'sunrise': 'weather-sunset-up',
    'check': 'check-circle',
    'locked': 'lock',
    'hundred': 'numeric-100-box',

    // Learning & Education
    'bookOpen': 'book-open-variant',
    'story': 'book-open-page-variant-outline',
    'flower': 'flower',

    // Communication
    'phoneCall': 'phone',
    'speaking': 'account-voice',
    'microphone2': 'microphone',
    'conversation': 'chat',

    // Time & Schedule
    'clock': 'clock-outline',
    'morning': 'weather-sunset-up',
    'night': 'weather-night',

    // General
    'lightbulb': 'lightbulb-on',
    'money': 'cash',
    'alert': 'alert-circle',
    'block': 'cancel',
    'walking': 'walk',
    'certificate': 'certificate',
    'stats': 'chart-bar',
    'voice': 'volume-high',
    'listen': 'ear-hearing',
    'read': 'book-open-variant',
    'profile': 'account',
    'woman': 'human-female',
    'edit': 'pencil',
    'hint': 'lightbulb-on-outline',
    'language': 'translate',
    'settings': 'cog',
    'help': 'help-circle',
    'logout': 'logout',
    'delete': 'delete',
    'camera': 'camera',
    'gallery': 'image',
    'close': 'close-circle',
    'success': 'check-circle',
    'error': 'alert-circle',
    'warning': 'alert',
    'info': 'information',
    'rainbow': 'weather-partly-rainy',
    'muscle': 'arm-flex',
    'rocket': 'rocket-launch',
    'hands': 'hands-pray'
};

// Helper function to get icon name
export const getIconName = (key) => {
    return ICON_MAP[key] || 'help-circle';
};
