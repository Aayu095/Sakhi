import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { useFonts } from 'expo-font';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import ThemedFinalHomeScreen from './src/screens/ThemedFinalHomeScreen';
import LearningScreen from './src/screens/LearningScreen';
import VideoLearningScreen from './src/screens/VideoLearningScreen';
import VideoLearningCategoriesScreen from './src/screens/VideoLearningCategoriesScreen';
import SimpleModuleLearningScreen from './src/screens/SimpleModuleLearningScreen';
import ModuleLearningCategoriesScreen from './src/screens/ModuleLearningCategoriesScreen';
import ImprovedGeminiVoiceCallScreen from './src/screens/ImprovedGeminiVoiceCallScreen';
import EnhancedStructuredLearningScreen from './src/screens/EnhancedStructuredLearningScreen';
import EnhancedConversationalScreen from './src/screens/EnhancedConversationalScreen';
import EnhancedProgressScreen from './src/screens/EnhancedProgressScreen';
import SeparateProgressScreen from './src/screens/SeparateProgressScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import EnhancedCallScreen from './src/screens/EnhancedCallScreen';
import AuthSignInScreen from './src/screens/AuthSignInScreen';
import AuthSignUpScreen from './src/screens/AuthSignUpScreen';
import MyProfileScreen from './src/screens/MyProfileScreen';
import { AuthProvider, AuthGate, useAuth } from './src/providers/AuthProvider';
import ImprovedHelpCornerScreen from './src/screens/ImprovedHelpCornerScreen';
import EnhancedWelcomeFlowScreen from './src/screens/EnhancedWelcomeFlowScreen';
import UpdatedHeaderMenu from './src/components/UpdatedHeaderMenu';
import ProfessionalHeader from './src/components/ProfessionalHeader';
import NotificationBell from './src/components/NotificationBell';
import HeaderRightSection from './src/components/HeaderRightSection';
import { theme } from './src/config/theme';

const Stack = createNativeStackNavigator();

function AuthedApp() {
  const { profile, user } = useAuth();

  // Show loading while profile is being loaded or user exists but no profile yet
  if (user && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0' }}>
        <ActivityIndicator size="large" color="#F5A623" />
      </View>
    );
  }

  // Show welcome flow if user has profile but hasn't completed welcome flow
  if (profile && profile.welcomeCompleted === false) {
    return (
      <Stack.Navigator
        initialRouteName="WelcomeFlow"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="WelcomeFlow"
          component={EnhancedWelcomeFlowScreen}
          options={{
            gestureEnabled: false, // Prevent going back during welcome flow
          }}
        />
      </Stack.Navigator>
    );
  }

  // If we reach here, user has completed welcome flow or is an existing user
  // Regular app navigation for users who completed welcome flow
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={ThemedFinalHomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => <ProfessionalHeader />,
          headerRight: () => <HeaderRightSection navigation={navigation} />,
          headerBackVisible: false,
          headerLeft: () => null,
        })}
      />

      {/* Main Learning Screens */}
      <Stack.Screen
        name="VideoLearningCategories"
        component={VideoLearningCategoriesScreen}
        options={{
          title: 'वीडियो से सीखें - Video Learning',
          headerBackTitle: 'वापस',
        }}
      />

      <Stack.Screen
        name="VideoLearning"
        component={VideoLearningScreen}
        options={{
          title: 'वीडियो देखें - Watch Videos',
          headerBackTitle: 'वापस',
        }}
      />

      <Stack.Screen
        name="ModuleLearningCategories"
        component={ModuleLearningCategoriesScreen}
        options={{
          title: 'मॉड्यूल से सीखें - Module Learning',
          headerBackTitle: 'वापस',
        }}
      />

      <Stack.Screen
        name="ModuleLearning"
        component={SimpleModuleLearningScreen}
        options={{
          title: 'पढ़कर सीखें - Read & Learn',
          headerBackTitle: 'वापस',
        }}
      />

      <Stack.Screen
        name="GeminiVoiceCall"
        component={ImprovedGeminiVoiceCallScreen}
        options={{
          title: 'सखी से बोलकर सीखें',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="SeparateProgress"
        component={SeparateProgressScreen}
        options={{
          title: 'आपकी प्रगति - Your Progress',
          headerBackTitle: 'वापस',
        }}
      />

      <Stack.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: 'समुदाय - Community Learning',
          headerBackTitle: 'वापस',
        }}
      />

      {/* Legacy Screens (keeping for backward compatibility) */}
      <Stack.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          title: 'सीख रहे हैं - Learning',
          headerBackTitle: 'वापस',
        }}
      />
      <Stack.Screen
        name="EnhancedStructuredLearning"
        component={EnhancedStructuredLearningScreen}
        options={{
          title: 'व्यवस्थित पाठ - Structured Learning',
          headerBackTitle: 'वापस',
        }}
      />
      <Stack.Screen
        name="EnhancedConversational"
        component={EnhancedConversationalScreen}
        options={{
          title: 'सखी से बातचीत',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="Call"
        component={EnhancedCallScreen}
        options={{
          title: 'सखी के साथ बात करें',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="Progress"
        component={EnhancedProgressScreen}
        options={{
          title: 'आपकी प्रगति - Your Progress',
          headerBackTitle: 'वापस',
        }}
      />

      {/* Other Screens */}
      <Stack.Screen
        name="Settings"
        component={MyProfileScreen}
        options={{
          title: 'मेरी प्रोफाइल - My Profile',
          headerBackTitle: 'वापस',
        }}
      />
      <Stack.Screen
        name="HelpCorner"
        component={ImprovedHelpCornerScreen}
        options={{
          title: 'मदद कॉर्नर - Help Corner',
          headerBackTitle: 'वापस',
        }}
      />
    </Stack.Navigator>
  );
}

function UnauthedApp() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="SignIn"
        component={AuthSignInScreen}
        options={{
          title: 'सखी में साइन इन करें',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={AuthSignUpScreen}
        options={{
          title: 'सखी के साथ जुड़ें',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useKeepAwake();

  const [fontsLoaded] = useFonts({
    'NotoSansDevanagari-Regular': NotoSansDevanagari_400Regular,
    'NotoSansDevanagari-Medium': NotoSansDevanagari_500Medium,
    'NotoSansDevanagari-SemiBold': NotoSansDevanagari_600SemiBold,
    'NotoSansDevanagari-Bold': NotoSansDevanagari_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0' }}>
        <MaterialCommunityIcons name="hands-pray" size={40} color="#F5A623" style={{ marginBottom: 16 }} />
        <ActivityIndicator size="large" color="#F5A623" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#6B5D52', fontFamily: 'NotoSansDevanagari-Medium' }}>सखी आ रही हैं...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AuthGate
          childrenAuthed={<AuthedApp />}
          childrenUnauthed={<UnauthedApp />}
        />
      </NavigationContainer>
    </AuthProvider>
  );
}