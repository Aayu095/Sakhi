// Centralized configuration for Sakhi
// Use EXPO_PUBLIC_* for values that need to be available in the client.

export const CONFIG = {
  // Firebase (Auth only)
  FIREBASE: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MSG,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },

  // Cloud services are opt-in. This keeps the call experience responsive when
  // an old API Gateway URL remains in a local .env after AWS access expires.
  AWS: {
    apiGatewayUrl: process.env.EXPO_PUBLIC_ENABLE_CLOUD_ASSISTANT === 'true'
      ? (process.env.EXPO_PUBLIC_API_GATEWAY_URL || '')
      : '',
  },
};
