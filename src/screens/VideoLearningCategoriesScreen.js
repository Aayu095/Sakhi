import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';

const { width } = Dimensions.get('window');

// Video Learning Categories for Under-Communities Women
const VIDEO_LEARNING_CATEGORIES = [
  {
    id: 'menstrual_health',
    title: 'महावारी की सही जानकारी',
    subtitle: 'Menstrual Health Education',
    description: 'महावारी के बारे में सही और पूरी जानकारी सीखें',
    icon: 'water-circle',
    color: ['#EC4899', '#F472B6'],
    duration: '15 मिनट',
    difficulty: 'आसान',
    videoCount: 3,
    topics: ['महावारी क्या है?', 'सफाई कैसे रखें?', 'गलत धारणाएं'],
    videos: [
      {
        id: 'what_is_menstruation',
        title: 'महावारी क्या है?',
        duration: '3 मिनट',
        thumbnailIcon: 'water',
        content: {
          videoScript: 'महावारी एक प्राकृतिक प्रक्रिया है जो हर महिला के साथ होती है। यह शरीर का सफाई का तरीका है।',
          keyPoints: [
            'महावारी 28 दिन में एक बार आती है',
            'यह 3-7 दिन तक रहती है',
            'यह बिल्कुल सामान्य और प्राकृतिक है',
            'इससे डरने की कोई बात नहीं है'
          ],
          practicalTips: [
            'साफ कपड़े या पैड का इस्तेमाल करें',
            'रोज नहाएं और साफ रहें',
            'पेट दर्द के लिए गर्म पानी की बोतल रखें'
          ]
        }
      },
      {
        id: 'menstrual_hygiene',
        title: 'महावारी में सफाई',
        duration: '4 मिनट',
        thumbnailIcon: 'soap',
        content: {
          videoScript: 'महावारी के दौरान सफाई बहुत जरूरी है। आइए सीखते हैं कि कैसे साफ रहें।',
          keyPoints: [
            'हर 4-6 घंटे में पैड बदलें',
            'साफ पानी से धोएं',
            'साबुन का इस्तेमाल करें',
            'सूखे और साफ कपड़े से पोंछें'
          ],
          practicalTips: [
            'इस्तेमाल किए गए पैड को कागज में लपेटकर फेंकें',
            'हाथ धोना न भूलें',
            'टाइट कपड़े न पहनें'
          ]
        }
      },
      {
        id: 'menstrual_myths',
        title: 'गलत धारणाओं को तोड़ें',
        duration: '5 मिनट',
        thumbnailIcon: 'close-circle',
        content: {
          videoScript: 'महावारी के बारे में कई गलत बातें कही जाती हैं। आइए सच जानते हैं।',
          keyPoints: [
            'महावारी में मंदिर जा सकते हैं',
            'खाना बना सकते हैं',
            'नहा सकते हैं',
            'सभी काम कर सकते हैं'
          ],
          practicalTips: [
            'अपने परिवार को सही जानकारी दें',
            'बेटियों को सही बातें सिखाएं',
            'डॉक्टर से सलाह लें'
          ]
        }
      }
    ]
  },
  {
    id: 'pregnancy_care',
    title: 'गर्भावस्था की देखभाल',
    subtitle: 'Pregnancy Care Guide',
    description: 'गर्भावस्था के दौरान सही देखभाल सीखें',
    icon: 'human-pregnant',
    color: ['#10B981', '#34D399'],
    duration: '20 मिनट',
    difficulty: 'मध्यम',
    videoCount: 4,
    topics: ['सही खाना', 'डॉक्टर की जांच', 'व्यायाम', 'प्रसव की तैयारी'],
    videos: [
      {
        id: 'pregnancy_nutrition',
        title: 'गर्भावस्था में सही खाना',
        duration: '6 मिनट',
        thumbnailIcon: 'food-apple',
        content: {
          videoScript: 'गर्भावस्था में सही खाना बहुत जरूरी है। मां और बच्चे दोनों के लिए।',
          keyPoints: [
            'हरी सब्जियां रोज खाएं',
            'दूध और दही जरूर लें',
            'फल खाना न भूलें',
            'पानी ज्यादा पिएं'
          ],
          practicalTips: [
            'आयरन की गोली लें',
            'फोलिक एसिड जरूरी है',
            'चाय-कॉफी कम करें'
          ]
        }
      },
      {
        id: 'pregnancy_checkups',
        title: 'नियमित जांच का महत्व',
        duration: '5 मिनट',
        thumbnailIcon: 'hospital-building',
        content: {
          videoScript: 'गर्भावस्था में नियमित डॉक्टर की जांच बहुत जरूरी है।',
          keyPoints: [
            'महीने में कम से कम एक बार जांच',
            'वजन और ब्लड प्रेशर चेक करवाएं',
            'बच्चे की हलचल पर ध्यान दें',
            'सभी टेस्ट जरूर कराएं'
          ],
          practicalTips: [
            'डॉक्टर की सलाह मानें',
            'दवाई समय पर लें',
            'कोई भी समस्या हो तो तुरंत बताएं'
          ]
        }
      },
      {
        id: 'pregnancy_exercise',
        title: 'गर्भावस्था में व्यायाम',
        duration: '4 मिनट',
        thumbnailIcon: 'walk',
        content: {
          videoScript: 'गर्भावस्था में हल्का व्यायाम करना अच्छा होता है।',
          keyPoints: [
            'रोज थोड़ा टहलना अच्छा है',
            'योग कर सकती हैं',
            'सांस की एक्सरसाइज करें',
            'भारी काम न करें'
          ],
          practicalTips: [
            'डॉक्टर से पूछकर व्यायाम करें',
            'थकान लगे तो आराम करें',
            'पानी पीते रहें'
          ]
        }
      },
      {
        id: 'delivery_preparation',
        title: 'प्रसव की तैयारी',
        duration: '5 मिनट',
        thumbnailIcon: 'baby-face',
        content: {
          videoScript: 'प्रसव के लिए पहले से तैयारी करना जरूरी है।',
          keyPoints: [
            'अस्पताल का बैग तैयार रखें',
            'परिवार को सब बातें बताएं',
            'डॉक्टर का नंबर सेव रखें',
            'पैसों का इंतजाम करें'
          ],
          practicalTips: [
            'घर से अस्पताल का रास्ता पता करें',
            'रात में भी जाने का इंतजाम रखें',
            'दाई या नर्स की मदद लें'
          ]
        }
      }
    ]
  },
  {
    id: 'digital_literacy',
    title: 'डिजिटल साक्षरता',
    subtitle: 'Digital Literacy for Women',
    description: 'फोन और डिजिटल चीजें सीखें',
    icon: 'cellphone-check',
    color: ['#3B82F6', '#60A5FA'],
    duration: '25 मिनट',
    difficulty: 'मध्यम',
    videoCount: 5,
    topics: ['फोन चलाना', 'UPI पेमेंट', 'WhatsApp', 'ऑनलाइन सुरक्षा', 'सरकारी योजनाएं'],
    videos: [
      {
        id: 'phone_basics',
        title: 'फोन चलाना सीखें',
        duration: '5 मिनट',
        thumbnailIcon: 'cellphone',
        content: {
          videoScript: 'स्मार्टफोन चलाना आसान है। आइए धीरे-धीरे सीखते हैं।',
          keyPoints: [
            'फोन को ऑन-ऑफ कैसे करें',
            'कॉल कैसे करें और रिसीव करें',
            'मैसेज कैसे भेजें',
            'फोटो कैसे खींचें'
          ],
          practicalTips: [
            'धीरे-धीरे प्रैक्टिस करें',
            'डरने की कोई बात नहीं',
            'परिवार से मदद लें'
          ]
        }
      },
      {
        id: 'upi_payments',
        title: 'UPI से पैसे भेजना',
        duration: '6 मिनट',
        thumbnailIcon: 'credit-card',
        content: {
          videoScript: 'UPI से आप फोन से ही पैसे भेज और ले सकते हैं। यह बहुत आसान और सुरक्षित है।',
          keyPoints: [
            'UPI एक डिजिटल पेमेंट सिस्टम है',
            'फोन नंबर से पैसे भेज सकते हैं',
            'QR कोड स्कैन करके पेमेंट करें',
            'बैंक अकाउंट से जुड़ा होता है'
          ],
          practicalTips: [
            'हमेशा UPI PIN डालें',
            'गलत नंबर पर पैसे न भेजें',
            'रसीद जरूर चेक करें'
          ]
        }
      },
      {
        id: 'whatsapp_usage',
        title: 'WhatsApp इस्तेमाल करना',
        duration: '5 मिनट',
        thumbnailIcon: 'message-text',
        content: {
          videoScript: 'WhatsApp से आप मैसेज, फोटो और वीडियो भेज सकते हैं।',
          keyPoints: [
            'मैसेज कैसे भेजें',
            'फोटो और वीडियो शेयर करें',
            'ग्रुप कैसे बनाएं',
            'वॉयस मैसेज भेजें'
          ],
          practicalTips: [
            'अनजान लोगों से बात न करें',
            'गलत जानकारी न फैलाएं',
            'प्राइवेसी सेटिंग चेक करें'
          ]
        }
      },
      {
        id: 'online_safety',
        title: 'ऑनलाइन सुरक्षा',
        duration: '4 मिनट',
        thumbnailIcon: 'lock',
        content: {
          videoScript: 'इंटरनेट इस्तेमाल करते समय सुरक्षा बहुत जरूरी है।',
          keyPoints: [
            'अपनी जानकारी किसी को न दें',
            'OTP किसी के साथ शेयर न करें',
            'फ्रॉड कॉल से बचें',
            'पासवर्ड मजबूत रखें'
          ],
          practicalTips: [
            'बैंक कभी भी OTP नहीं मांगता',
            'संदिग्ध लिंक पर क्लिक न करें',
            'अगर कोई परेशानी हो तो पुलिस को बताएं'
          ]
        }
      },
      {
        id: 'government_schemes',
        title: 'सरकारी योजनाओं की जानकारी',
        duration: '5 मिनट',
        thumbnailIcon: 'bank',
        content: {
          videoScript: 'सरकार महिलाओं के लिए कई योजनाएं चलाती है। आइए जानते हैं।',
          keyPoints: [
            'जन धन योजना',
            'प्रधानमंत्री मुद्रा योजना',
            'बेटी बचाओ बेटी पढ़ाओ',
            'आयुष्मान भारत योजना'
          ],
          practicalTips: [
            'नजदीकी बैंक में जाकर पूछें',
            'आधार कार्ड जरूर बनवाएं',
            'सभी दस्तावेज तैयार रखें'
          ]
        }
      }
    ]
  },
  {
    id: 'health_nutrition',
    title: 'स्वास्थ्य और पोषण',
    subtitle: 'Health & Nutrition Guide',
    description: 'परिवार के स्वास्थ्य की देखभाल सीखें',
    icon: 'hospital-box',
    color: ['#F59E0B', '#FBBF24'],
    duration: '18 मिनट',
    difficulty: 'आसान',
    videoCount: 4,
    topics: ['संतुलित आहार', 'बच्चों का टीकाकरण', 'सफाई', 'घरेलू उपचार'],
    videos: [
      {
        id: 'balanced_diet',
        title: 'संतुलित आहार का महत्व',
        duration: '5 मिनट',
        thumbnailIcon: 'food-variant',
        content: {
          videoScript: 'अच्छी सेहत के लिए संतुलित आहार बहुत जरूरी है।',
          keyPoints: [
            'दाल-चावल रोज खाएं',
            'हरी सब्जियां जरूर लें',
            'फल खाना न भूलें',
            'दूध और दही का सेवन करें'
          ],
          practicalTips: [
            'तली हुई चीजें कम खाएं',
            'पानी ज्यादा पिएं',
            'समय पर खाना खाएं'
          ]
        }
      },
      {
        id: 'child_vaccination',
        title: 'बच्चों का टीकाकरण',
        duration: '4 मिनट',
        thumbnailIcon: 'needle',
        content: {
          videoScript: 'बच्चों का टीकाकरण उन्हें बीमारियों से बचाता है।',
          keyPoints: [
            'जन्म के तुरंत बाद टीके लगवाएं',
            'समय पर सभी टीके लगवाएं',
            'टीकाकरण कार्ड संभालकर रखें',
            'मुफ्त टीके सरकारी अस्पताल में मिलते हैं'
          ],
          practicalTips: [
            'टीकाकरण की तारीख याद रखें',
            'बुखार आए तो डॉक्टर को दिखाएं',
            'सभी बच्चों का टीकाकरण कराएं'
          ]
        }
      },
      {
        id: 'hygiene_practices',
        title: 'सफाई की आदतें',
        duration: '4 मिनट',
        thumbnailIcon: 'soap',
        content: {
          videoScript: 'सफाई से कई बीमारियों से बचा जा सकता है।',
          keyPoints: [
            'खाना खाने से पहले हाथ धोएं',
            'शौच के बाद हाथ जरूर धोएं',
            'घर को साफ रखें',
            'पानी को ढककर रखें'
          ],
          practicalTips: [
            'साबुन से हाथ धोएं',
            'नाखून काटकर रखें',
            'कूड़ा-कचरा सही जगह फेंकें'
          ]
        }
      },
      {
        id: 'home_remedies',
        title: 'घरेलू उपचार',
        duration: '5 मिनट',
        thumbnailIcon: 'leaf',
        content: {
          videoScript: 'छोटी-मोटी बीमारियों के लिए घरेलू उपचार कर सकते हैं।',
          keyPoints: [
            'खांसी के लिए शहद और अदरक',
            'बुखार के लिए ठंडी पट्टी',
            'पेट दर्द के लिए हींग का पानी',
            'सिर दर्द के लिए तेल की मालिश'
          ],
          practicalTips: [
            'ज्यादा परेशानी हो तो डॉक्टर के पास जाएं',
            'बच्चों को कोई भी दवा देने से पहले डॉक्टर से पूछें',
            'घरेलू नुस्खे सावधानी से करें'
          ]
        }
      }
    ]
  },
  {
    id: 'womens_rights',
    title: 'महिला अधिकार',
    subtitle: 'Women\'s Rights & Safety',
    description: 'अपने अधिकार और सुरक्षा के बारे में जानें',
    icon: 'scale-balance',
    color: ['#8B5CF6', '#A78BFA'],
    duration: '22 मिनट',
    difficulty: 'मध्यम',
    videoCount: 4,
    topics: ['कानूनी अधिकार', 'घरेलू हिंसा', 'हेल्पलाइन नंबर', 'आर्थिक स्वतंत्रता'],
    videos: [
      {
        id: 'legal_rights',
        title: 'महिलाओं के कानूनी अधिकार',
        duration: '6 मिनट',
        thumbnailIcon: 'scale-balance',
        content: {
          videoScript: 'हर महिला के कुछ कानूनी अधिकार हैं जिन्हें जानना जरूरी है।',
          keyPoints: [
            'शिक्षा का अधिकार',
            'काम करने का अधिकार',
            'संपत्ति में हिस्सा',
            'वोट देने का अधिकार'
          ],
          practicalTips: [
            'अपने अधिकारों को जानें',
            'जरूरत पड़ने पर कानूनी मदद लें',
            'महिला हेल्पलाइन का नंबर याद रखें'
          ]
        }
      },
      {
        id: 'domestic_violence',
        title: 'घरेलू हिंसा से बचाव',
        duration: '5 मिनट',
        thumbnailIcon: 'cancel',
        content: {
          videoScript: 'घरेलू हिंसा गलत है और इसके खिलाफ कानून है।',
          keyPoints: [
            'मारपीट करना गुनाह है',
            'आप अकेली नहीं हैं',
            'मदद मांगना गलत नहीं',
            'पुलिस आपकी मदद करेगी'
          ],
          practicalTips: [
            '181 नंबर पर कॉल करें',
            'भरोसेमंद लोगों से बात करें',
            'सबूत इकट्ठे करके रखें'
          ]
        }
      },
      {
        id: 'helpline_numbers',
        title: 'जरूरी हेल्पलाइन नंबर',
        duration: '4 मिनट',
        thumbnailIcon: 'phone',
        content: {
          videoScript: 'मुसीबत में ये नंबर आपकी मदद कर सकते हैं।',
          keyPoints: [
            '181 - महिला हेल्पलाइन',
            '1091 - महिला पावर लाइन',
            '100 - पुलिस',
            '108 - एम्बुलेंस'
          ],
          practicalTips: [
            'ये नंबर अपने फोन में सेव करें',
            '24 घंटे मदद मिलती है',
            'हिंदी में बात कर सकते हैं'
          ]
        }
      },
      {
        id: 'economic_independence',
        title: 'आर्थिक स्वतंत्रता',
        duration: '7 मिनट',
        thumbnailIcon: 'cash-multiple',
        content: {
          videoScript: 'आर्थिक स्वतंत्रता से आप मजबूत बनती हैं।',
          keyPoints: [
            'अपना बैंक अकाउंट खोलें',
            'छोटा-मोटा काम शुरू करें',
            'पैसे बचाने की आदत डालें',
            'सरकारी योजनाओं का फायदा उठाएं'
          ],
          practicalTips: [
            'सिलाई, कढ़ाई सीखें',
            'घर से ही काम शुरू करें',
            'SHG ग्रुप से जुड़ें',
            'मुद्रा लोन के बारे में पूछें'
          ]
        }
      }
    ]
  }
];

export default function VideoLearningCategoriesScreen({ navigation }) {
  const { profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      const welcomeMessage = 'वीडियो से सीखने के लिए कोई भी विषय चुनें। सभी वीडियो आपकी भाषा में हैं।';
      speakText(welcomeMessage);
    }, 1000);
  }, []);

  const speakText = (text) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.8,
      pitch: 1.0,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const handleCategoryPress = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to video learning screen with selected category
    navigation.navigate('VideoLearning', {
      moduleData: category
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>वीडियो से सीखें</Text>
      <Text style={styles.headerSubtitle}>Video Learning Categories</Text>
      <Text style={styles.headerDescription}>
        अपनी पसंद का विषय चुनें और वीडियो देखकर सीखें
      </Text>
    </View>
  );

  const renderCategoryCard = (category, index) => (
    <View key={category.id}
      style={styles.categoryWrapper}
    >
      <Pressable
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category)}
      >
        <LinearGradient
          colors={category.color}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryHeader}>
            <MaterialCommunityIcons name={category.icon} size={48} color="#FFFFFF" />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>
          </View>

          <Text style={styles.categoryDescription}>{category.description}</Text>

          <View style={styles.categoryStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="video-vintage" size={20} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.statText}>{category.videoCount} वीडियो</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.statText}>{category.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="chart-line" size={20} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.statText}>{category.difficulty}</Text>
            </View>
          </View>

          <View style={styles.topicsPreview}>
            <Text style={styles.topicsTitle}>मुख्य विषय:</Text>
            <View style={styles.topicsList}>
              {category.topics.slice(0, 3).map((topic, topicIndex) => (
                <Text key={topicIndex} style={styles.topicItem}>
                  • {topic}
                </Text>
              ))}
              {category.topics.length > 3 && (
                <Text style={styles.topicItem}>
                  और {category.topics.length - 3} विषय...
                </Text>
              )}
            </View>
          </View>

          <View style={styles.categoryAction}>
            <Text style={styles.actionText}>वीडियो देखना शुरू करें →</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <View style={styles.categoriesContainer}>
          {VIDEO_LEARNING_CATEGORIES.map((category, index) =>
            renderCategoryCard(category, index)
          )}
        </View>

        {/* Voice Control */}
        <View style={styles.voiceSection}>
          <Pressable
            style={styles.voiceButton}
            onPress={() => speakText('ये सभी वीडियो आपकी मदद के लिए हैं। कोई भी विषय चुनकर सीखना शुरू करें।')}
            disabled={isPlaying}
          >
            <LinearGradient
              colors={['#8B7355', '#A67C52']}
              style={styles.voiceGradient}
            >
              <MaterialCommunityIcons name="volume-high" size={20} color="#FFFFFF" />
              <Text style={styles.voiceText}>
                {isPlaying ? 'बोल रही हूं...' : 'जानकारी सुनें'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary[600],
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  categoriesContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  categoryWrapper: {
    marginBottom: SPACING.md,
  },
  categoryCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryGradient: {
    padding: SPACING.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryIcon: {
    fontSize: 48,
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  categorySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  topicsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  topicsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
  },
  topicsList: {
    gap: SPACING.xs,
  },
  topicItem: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  categoryAction: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  voiceButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  voiceGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  voiceIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  voiceText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

// Export categories for use in other screens
export { VIDEO_LEARNING_CATEGORIES };