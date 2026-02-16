
// Expo Go Compatible Version
// Native speech recognition removed for compatibility

// STT Providers
export const STT_PROVIDERS = {
  REAL: 'real',   // Now defaults to demo or web-based fallback
  DEMO: 'demo',   // Fake responses for testing in Expo Go
};

// Language codes for Indian languages
export const SUPPORTED_LANGUAGES = {
  'hi-IN': { name: 'हिंदी', code: 'hi-IN' },
  'en-IN': { name: 'English (India)', code: 'en-IN' },
  'bn-IN': { name: 'বাংলা', code: 'bn-IN' },
  'ta-IN': { name: 'தமிழ்', code: 'ta-IN' },
  'te-IN': { name: 'తెలుగు', code: 'te-IN' },
  'mr-IN': { name: 'मराठी', code: 'mr-IN' },
  'gu-IN': { name: 'ગુજરાતી', code: 'gu-IN' },
  'kn-IN': { name: 'ಕನ್ನಡ', code: 'kn-IN' },
  'ml-IN': { name: 'മലയാളം', code: 'ml-IN' },
  'pa-IN': { name: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
};

// Demo responses for fallback
const DEMO_RESPONSES = {
  greeting: [
    'नमस्ते दीदी! मैं आपकी मदद के लिए यहां हूं',
    'हैलो! आज कैसे मदद कर सकती हूं?',
    'नमस्कार! क्या जानना चाहती हैं?',
  ],
  health: [
    'स्वास्थ्य के बारे में पूछना चाहती हूं',
    'डॉक्टर से कब मिलना चाहिए?',
  ],
  education: [
    'बच्चों की पढ़ाई के बारे में बताइए',
    'ऑनलाइन क्लास कैसे जॉइन करें?',
  ],
  finance: [
    'UPI पेमेंट कैसे करते हैं?',
    'बैंक अकाउंट कैसे खोलें?',
  ],
  rights: [
    'महिला अधिकार क्या हैं?',
    'हेल्पलाइन नंबर क्या है?',
  ],
  technology: [
    'WhatsApp कैसे इस्तेमाल करें?',
    'डिजिटल पेमेंट कैसे करें?',
  ],
};

// ============================================
// STUBBED REAL SPEECH-TO-TEXT (Safe for Expo Go)
// ============================================

function realSTT(language = 'hi-IN') {
  return new Promise((resolve) => {
    console.warn('Real STT is disabled in Expo Go mode. Falling back to Demo.');
    setTimeout(() => {
      resolve({
        success: false,
        error: 'Real STT disabled in Expo Go',
        text: '',
        provider: 'real',
      });
    }, 1000);
  });
}

export function stopRealSTT() {
  console.log('Stop Real STT (Stubbed)');
}

export async function requestSTTPermissions() {
  console.log('Request Permissions (Stubbed)');
  return { granted: true }; // Fake grant for UI logic to proceed
}

export function isRealSTTAvailable() {
  return false; // Force false to trigger fallback logic
}

// ============================================
// DEMO STT (Fallback for Expo Go / testing)
// ============================================

async function demoSTT(language = 'hi-IN', context = 'general') {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  const contextResponses = DEMO_RESPONSES[context] || DEMO_RESPONSES.greeting;
  const allResponses = [
    ...DEMO_RESPONSES.greeting,
    ...DEMO_RESPONSES.health,
    ...DEMO_RESPONSES.finance,
    ...DEMO_RESPONSES.technology,
  ];

  // 70% contextual, 30% random
  const response = Math.random() < 0.7
    ? contextResponses[Math.floor(Math.random() * contextResponses.length)]
    : allResponses[Math.floor(Math.random() * allResponses.length)];

  return {
    success: true,
    text: response,
    confidence: 0.88 + Math.random() * 0.1,
    language,
    provider: 'demo',
    isDemo: true,
  };
}

// ============================================
// MAIN STT FUNCTION
// ============================================

export async function speechToText(audioUri, options = {}) {
  const {
    language = 'hi-IN',
    provider = STT_PROVIDERS.REAL,
    context = 'general',
  } = options;

  // Always use Demo in this version
  console.log('🎤 Using Demo STT (Expo Go Compatible)');
  return await demoSTT(language, context);
}

// Utility functions
export function detectLanguage() {
  return Promise.resolve({ language: 'hi-IN', confidence: 0.8 });
}

export function getAvailableLanguages() {
  return Object.values(SUPPORTED_LANGUAGES);
}

export function isLanguageSupported(languageCode) {
  return languageCode in SUPPORTED_LANGUAGES;
}

export function getLanguageName(languageCode) {
  return SUPPORTED_LANGUAGES[languageCode]?.name || languageCode;
}
