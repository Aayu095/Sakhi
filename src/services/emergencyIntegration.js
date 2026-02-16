import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';

// Emergency services integration for women's safety
export const EMERGENCY_SERVICES = {
  WOMEN_HELPLINE: {
    number: '1091',
    name: 'महिला हेल्पलाइन',
    description: '24x7 महिला सुरक्षा हेल्पलाइन',
    type: 'women_safety',
  },
  POLICE: {
    number: '100',
    name: 'पुलिस',
    description: 'तुरंत पुलिस सहायता',
    type: 'emergency',
  },
  AMBULANCE: {
    number: '108',
    name: 'एम्बुलेंस',
    description: 'मेडिकल इमरजेंसी',
    type: 'medical',
  },
  FIRE: {
    number: '101',
    name: 'फायर ब्रिगेड',
    description: 'आग और बचाव सेवा',
    type: 'fire',
  },
  CHILD_HELPLINE: {
    number: '1098',
    name: 'चाइल्ड हेल्पलाइन',
    description: 'बच्चों की सुरक्षा हेल्पलाइन',
    type: 'child_safety',
  },
  DOMESTIC_VIOLENCE: {
    number: '181',
    name: 'घरेलू हिंसा हेल्पलाइन',
    description: 'घरेलू हिंसा के खिलाफ सहायता',
    type: 'domestic_violence',
  },
};

// State-wise emergency numbers (sample for major states)
export const STATE_EMERGENCY_NUMBERS = {
  'Delhi': {
    women_helpline: '181',
    police_control_room: '011-23490000',
    women_safety_app: 'Himmat Plus',
  },
  'Maharashtra': {
    women_helpline: '103',
    police_control_room: '022-22621855',
    women_safety_app: 'Maha Police',
  },
  'Karnataka': {
    women_helpline: '1091',
    police_control_room: '080-22942444',
    women_safety_app: 'Suraksha',
  },
  'Tamil Nadu': {
    women_helpline: '044-28447777',
    police_control_room: '044-23452001',
    women_safety_app: 'Kavalan SOS',
  },
  'West Bengal': {
    women_helpline: '033-24799633',
    police_control_room: '033-22143526',
    women_safety_app: 'WB Police',
  },
  'Uttar Pradesh': {
    women_helpline: '1090',
    police_control_room: '0522-2238902',
    women_safety_app: 'UP Police Citizen',
  },
};

// Government schemes and helplines
export const GOVERNMENT_SCHEMES = {
  UJJWALA: {
    name: 'प्रधानमंत्री उज्ज्वला योजना',
    helpline: '1906',
    description: 'मुफ्त गैस कनेक्शन योजना',
    eligibility: 'BPL परिवार की महिलाएं',
    documents: ['राशन कार्ड', 'आधार कार्ड', 'बैंक पासबुक'],
  },
  JAN_DHAN: {
    name: 'जन धन योजना',
    helpline: '1800-11-0001',
    description: 'मुफ्त बैंक खाता योजना',
    eligibility: 'सभी भारतीय नागरिक',
    documents: ['आधार कार्ड', 'पहचान प्रमाण'],
  },
  AYUSHMAN_BHARAT: {
    name: 'आयुष्मान भारत',
    helpline: '14555',
    description: '5 लाख तक का मुफ्त इलाज',
    eligibility: 'गरीब परिवार',
    documents: ['राशन कार्ड', 'आधार कार्ड'],
  },
  SUKANYA_SAMRIDDHI: {
    name: 'सुकन्या समृद्धि योजना',
    helpline: '1800-266-6868',
    description: 'बेटी की शिक्षा और शादी के लिए बचत',
    eligibility: '10 साल तक की बेटी',
    documents: ['बेटी का जन्म प्रमाण पत्र', 'माता-पिता का आधार'],
  },
};

// Emergency contact management
export async function saveEmergencyContacts(contacts) {
  try {
    await AsyncStorage.setItem('emergency_contacts', JSON.stringify(contacts));
    return { success: true };
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
    return { success: false, error: error.message };
  }
}

export async function getEmergencyContacts() {
  try {
    const contacts = await AsyncStorage.getItem('emergency_contacts');
    return contacts ? JSON.parse(contacts) : [];
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
}

// Quick emergency call
export async function makeEmergencyCall(serviceType) {
  try {
    const service = EMERGENCY_SERVICES[serviceType];
    if (!service) {
      throw new Error('Emergency service not found');
    }

    const phoneNumber = `tel:${service.number}`;
    const canCall = await Linking.canOpenURL(phoneNumber);
    
    if (canCall) {
      Alert.alert(
        'इमरजेंसी कॉल',
        `${service.name} (${service.number}) को कॉल करना चाहते हैं?`,
        [
          { text: 'रद्द करें', style: 'cancel' },
          { 
            text: 'कॉल करें', 
            onPress: () => Linking.openURL(phoneNumber),
            style: 'destructive'
          }
        ]
      );
      
      // Track emergency call for analytics
      await trackEmergencyAction('call_initiated', {
        service: serviceType,
        timestamp: Date.now(),
      });
      
      return { success: true };
    } else {
      throw new Error('Cannot make phone calls on this device');
    }
  } catch (error) {
    console.error('Error making emergency call:', error);
    return { success: false, error: error.message };
  }
}

// Send emergency SMS with location
export async function sendEmergencySMS(contacts, message) {
  try {
    const location = await getCurrentLocation();
    const locationText = location 
      ? `मेरी लोकेशन: https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : 'लोकेशन उपलब्ध नहीं है';
    
    const fullMessage = `${message}\n\n${locationText}\n\nSakhi ऐप से भेजा गया`;
    
    for (const contact of contacts) {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(fullMessage)}`;
      const canSendSMS = await Linking.canOpenURL(smsUrl);
      
      if (canSendSMS) {
        await Linking.openURL(smsUrl);
      }
    }
    
    await trackEmergencyAction('sms_sent', {
      contactCount: contacts.length,
      hasLocation: !!location,
      timestamp: Date.now(),
    });
    
    return { success: true, message: 'इमरजेंसी SMS भेजे गए' };
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return { success: false, error: error.message };
  }
}

// Get current location for emergency
async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

// Setup emergency notifications
export async function setupEmergencyNotifications() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Notification permission not granted' };
    }

    // Schedule daily safety reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'सुरक्षा रिमाइंडर 🛡️',
        body: 'अपने इमरजेंसी कॉन्टैक्ट्स को अपडेट रखें और सुरक्षित रहें।',
        data: { type: 'safety_reminder' },
      },
      trigger: {
        hour: 20, // 8 PM
        minute: 0,
        repeats: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting up emergency notifications:', error);
    return { success: false, error: error.message };
  }
}

// Get location-based emergency services
export async function getLocationBasedServices() {
  try {
    const location = await getCurrentLocation();
    if (!location) {
      return { success: false, error: 'Location not available' };
    }

    // Mock implementation - in real app, use reverse geocoding API
    const mockState = 'Delhi'; // This would be determined from coordinates
    const stateServices = STATE_EMERGENCY_NUMBERS[mockState] || {};
    
    return {
      success: true,
      services: {
        ...EMERGENCY_SERVICES,
        state_specific: stateServices,
      },
      location: {
        state: mockState,
        coordinates: location,
      },
    };
  } catch (error) {
    console.error('Error getting location-based services:', error);
    return { success: false, error: error.message };
  }
}

// Emergency panic button
export async function triggerPanicMode() {
  try {
    const contacts = await getEmergencyContacts();
    
    if (contacts.length === 0) {
      Alert.alert(
        'इमरजेंसी कॉन्टैक्ट नहीं मिले',
        'पहले अपने इमरजेंसी कॉन्टैक्ट्स सेव करें।',
        [{ text: 'ठीक है' }]
      );
      return { success: false, error: 'No emergency contacts found' };
    }

    // Send emergency SMS to all contacts
    const smsResult = await sendEmergencySMS(
      contacts,
      '🚨 इमरजेंसी! मुझे तुरंत मदद चाहिए। कृपया मुझसे संपर्क करें।'
    );

    // Show emergency services options
    Alert.alert(
      '🚨 इमरजेंसी मोड सक्रिय',
      'आपके कॉन्टैक्ट्स को मैसेज भेज दिया गया है। अब क्या करना चाहते हैं?',
      [
        { text: 'पुलिस को कॉल करें', onPress: () => makeEmergencyCall('POLICE') },
        { text: 'महिला हेल्पलाइन', onPress: () => makeEmergencyCall('WOMEN_HELPLINE') },
        { text: 'एम्बुलेंस', onPress: () => makeEmergencyCall('AMBULANCE') },
        { text: 'रद्द करें', style: 'cancel' },
      ]
    );

    await trackEmergencyAction('panic_mode_activated', {
      timestamp: Date.now(),
      contactsNotified: contacts.length,
    });

    return { success: true };
  } catch (error) {
    console.error('Error triggering panic mode:', error);
    return { success: false, error: error.message };
  }
}

// Get government scheme information
export function getGovernmentSchemeInfo(schemeName) {
  const scheme = GOVERNMENT_SCHEMES[schemeName];
  if (!scheme) {
    return { success: false, error: 'Scheme not found' };
  }

  return {
    success: true,
    scheme: {
      ...scheme,
      howToApply: getApplicationProcess(schemeName),
      nearbyOffices: getNearbyGovernmentOffices(schemeName),
    },
  };
}

// Mock application process
function getApplicationProcess(schemeName) {
  const processes = {
    UJJWALA: [
      'नजदीकी गैस एजेंसी में जाएं',
      'आवश्यक दस्तावेज ले जाएं',
      'फॉर्म भरें और जमा करें',
      '15 दिन में कनेक्शन मिलेगा',
    ],
    JAN_DHAN: [
      'नजदीकी बैंक में जाएं',
      'आधार कार्ड ले जाएं',
      'फॉर्म भरें',
      'तुरंत खाता खुल जाएगा',
    ],
    AYUSHMAN_BHARAT: [
      'नजदीकी CSC सेंटर जाएं',
      'पात्रता चेक कराएं',
      'गोल्डन कार्ड बनवाएं',
      'हॉस्पिटल में इलाज कराएं',
    ],
  };

  return processes[schemeName] || ['जानकारी उपलब्ध नहीं है'];
}

// Mock nearby offices
function getNearbyGovernmentOffices(schemeName) {
  // In real implementation, use location and government APIs
  return [
    {
      name: 'जिला कलेक्टर कार्यालय',
      address: 'मुख्य बाजार, शहर',
      phone: '0XXX-XXXXXXX',
      distance: '2 किमी',
    },
    {
      name: 'ब्लॉक कार्यालय',
      address: 'सरकारी अस्पताल के पास',
      phone: '0XXX-XXXXXXX',
      distance: '5 किमी',
    },
  ];
}

// Track emergency actions for analytics
async function trackEmergencyAction(action, data) {
  try {
    const emergencyLog = {
      action,
      data,
      timestamp: Date.now(),
    };

    const existingLogs = await AsyncStorage.getItem('emergency_logs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    logs.push(emergencyLog);
    
    // Keep only last 100 emergency logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    await AsyncStorage.setItem('emergency_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error tracking emergency action:', error);
  }
}

// Safety tips based on current time and location
export function getSafetyTips() {
  const hour = new Date().getHours();
  const tips = [];

  if (hour >= 20 || hour <= 6) {
    tips.push({
      title: 'रात की सुरक्षा',
      tips: [
        'अकेले बाहर न निकलें',
        'अपना फोन चार्ज रखें',
        'किसी को अपनी लोकेशन बताकर जाएं',
        'अच्छी रोशनी वाले रास्ते इस्तेमाल करें',
      ],
    });
  }

  tips.push({
    title: 'डिजिटल सुरक्षा',
    tips: [
      'OTP किसी के साथ शेयर न करें',
      'अनजान लिंक पर क्लिक न करें',
      'फेक कॉल से बचें',
      'UPI PIN सुरक्षित रखें',
    ],
  });

  tips.push({
    title: 'घरेलू सुरक्षा',
    tips: [
      'इमरजेंसी नंबर याद रखें',
      'दरवाजा खोलने से पहले देख लें',
      'गैस और बिजली की जांच करें',
      'पड़ोसियों से अच्छे संबंध रखें',
    ],
  });

  return tips;
}
