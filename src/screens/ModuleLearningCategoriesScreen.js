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

// Module Learning Categories for Under-Communities Women (Reading-based)
const MODULE_LEARNING_CATEGORIES = [
  {
    id: 'menstrual_health_reading',
    title: 'महावारी की जानकारी',
    subtitle: 'Menstrual Health Guide',
    description: 'महावारी के बारे में पढ़कर सीखें',
    icon: 'water-circle',
    color: ['#EC4899', '#F472B6'],
    readingTime: '10 मिनट',
    difficulty: 'आसान',
    sectionCount: 4,
    topics: ['महावारी क्या है?', 'सफाई कैसे रखें?', 'दर्द से राहत', 'गलत धारणाएं'],
    content: {
      sections: [
        {
          title: 'महावारी क्या है?',
          content: `महावारी (मासिक धर्म) एक प्राकृतिक प्रक्रिया है जो हर महिला के साथ होती है।

मुख्य बातें:
• यह हर 28 दिन में एक बार आती है
• 3-7 दिन तक रहती है  
• यह बिल्कुल सामान्य और प्राकृतिक है
• इससे डरने या शर्म करने की कोई बात नहीं है

यह क्यों होती है:
• यह शरीर की सफाई का तरीका है
• हर महीने शरीर बच्चे के लिए तैयारी करता है
• जब बच्चा नहीं होता तो यह सफाई हो जाती है`
        },
        {
          title: 'सफाई कैसे रखें?',
          content: `महावारी के दौरान सफाई बहुत जरूरी है:

सफाई के नियम:
• हर 4-6 घंटे में पैड बदलें
• साफ पानी से धोएं
• साबुन का इस्तेमाल करें
• सूखे और साफ कपड़े से पोंछें
• हाथ धोना न भूलें

पैड का सही इस्तेमाल:
• साफ हाथों से पैड लगाएं
• इस्तेमाल के बाद कागज में लपेटकर फेंकें
• कपड़े का इस्तेमाल करें तो रोज धोएं`
        },
        {
          title: 'दर्द से कैसे राहत पाएं?',
          content: `महावारी में दर्द होना सामान्य है, लेकिन इससे राहत पा सकते हैं:

घरेलू उपाय:
• गर्म पानी की बोतल पेट पर रखें
• हल्की मालिश करें
• गर्म पानी से नहाएं
• आराम करें

खाने-पीने में सावधानी:
• गर्म चीजें खाएं
• ज्यादा पानी पिएं
• ठंडी चीजों से बचें
• हरी सब्जी और फल खाएं

कब डॉक्टर के पास जाएं:
• बहुत ज्यादा दर्द हो
• 7 दिन से ज्यादा हो
• बहुत ज्यादा खून आए`
        },
        {
          title: 'गलत धारणाओं को तोड़ें',
          content: `महावारी के बारे में कई गलत बातें कही जाती हैं। सच जानें:

सच्चाई:
• महावारी में मंदिर जा सकते हैं
• खाना बना सकते हैं
• नहा सकते हैं
• सभी काम कर सकते हैं
• यह गंदी या अशुद्ध चीज नहीं है

क्या करें:
• अपने परिवार को सही जानकारी दें
• बेटियों को सही बातें सिखाएं
• डॉक्टर से सलाह लें
• दूसरी महिलाओं की मदद करें`
        }
      ]
    }
  },
  {
    id: 'pregnancy_care_reading',
    title: 'गर्भावस्था की देखभाल',
    subtitle: 'Pregnancy Care Guide',
    description: 'गर्भावस्था में सही देखभाल के बारे में पढ़ें',
    icon: 'baby-carriage',
    color: ['#10B981', '#34D399'],
    readingTime: '15 मिनट',
    difficulty: 'मध्यम',
    sectionCount: 5,
    topics: ['सही खाना', 'नियमित जांच', 'व्यायाम', 'सावधानियां', 'प्रसव की तैयारी'],
    content: {
      sections: [
        {
          title: 'गर्भावस्था में सही खाना',
          content: `गर्भावस्था में सही खाना मां और बच्चे दोनों के लिए जरूरी है:

जरूरी चीजें:
• हरी सब्जियां रोज खाएं
• दूध और दही जरूर लें
• फल खाना न भूलें
• दाल-चावल नियमित लें
• पानी ज्यादा पिएं

बचने वाली चीजें:
• कच्चा मांस न खाएं
• ज्यादा चाय-कॉफी न पिएं
• धूम्रपान बिल्कुल न करें
• शराब न पिएं

डॉक्टर की सलाह:
• आयरन की गोली लें
• फोलिक एसिड जरूरी है
• कैल्शियम की गोली लें`
        },
        {
          title: 'नियमित जांच का महत्व',
          content: `गर्भावस्था में नियमित डॉक्टर की जांच बहुत जरूरी है:

कब जांच कराएं:
• महीने में कम से कम एक बार
• पहले 3 महीने में ज्यादा ध्यान दें
• आखिरी महीने में हफ्ते में एक बार
• कोई समस्या हो तो तुरंत जाएं

क्या जांच होती है:
• वजन और ब्लड प्रेशर चेक
• बच्चे की हलचल देखना
• खून की जांच
• पेट का अल्ट्रासाउंड

जरूरी बातें:
• सभी रिपोर्ट संभालकर रखें
• डॉक्टर की सलाह मानें
• दवाई समय पर लें`
        },
        {
          title: 'गर्भावस्था में व्यायाम',
          content: `गर्भावस्था में हल्का व्यायाम करना अच्छा होता है:

सुरक्षित व्यायाम:
• रोज थोड़ा टहलना
• हल्का योग कर सकती हैं
• सांस की एक्सरसाइज करें
• हल्की स्ट्रेचिंग करें

बचने वाले काम:
• भारी सामान न उठाएं
• ज्यादा झुकना-उठना न करें
• तेज दौड़ना न करें
• खतरनाक खेल न खेलें

सावधानियां:
• डॉक्टर से पूछकर व्यायाम करें
• थकान लगे तो आराम करें
• पानी पीते रहें
• चक्कर आए तो रुक जाएं`
        },
        {
          title: 'गर्भावस्था में सावधानियां',
          content: `गर्भावस्था में कुछ खास सावधानियां रखनी चाहिए:

दैनिक सावधानियां:
• भारी काम न करें
• ज्यादा तनाव न लें
• पूरी नींद लें
• साफ-सफाई रखें

खतरे के संकेत:
• तेज पेट दर्द
• ज्यादा उल्टी आना
• खून आना
• तेज सिर दर्द
• सूजन आना

तुरंत डॉक्टर के पास जाएं अगर:
• बच्चे की हलचल कम लगे
• बुखार आ जाए
• सांस लेने में तकलीफ हो
• चक्कर ज्यादा आएं`
        },
        {
          title: 'प्रसव की तैयारी',
          content: `प्रसव के लिए पहले से तैयारी करना जरूरी है:

अस्पताल की तैयारी:
• अस्पताल का बैग तैयार रखें
• जरूरी कागजात रखें
• पैसों का इंतजाम करें
• डॉक्टर का नंबर सेव रखें

घर की तैयारी:
• परिवार को सब बातें बताएं
• घर से अस्पताल का रास्ता पता करें
• रात में भी जाने का इंतजाम रखें
• बच्चे के लिए कपड़े तैयार करें

मानसिक तैयारी:
• डर न करें, यह प्राकृतिक है
• सकारात्मक सोचें
• परिवार का साथ लें
• दाई या नर्स की मदद लें`
        }
      ]
    }
  },
  {
    id: 'digital_literacy_reading',
    title: 'डिजिटल साक्षरता',
    subtitle: 'Digital Literacy Guide',
    description: 'फोन और डिजिटल चीजों के बारे में पढ़कर सीखें',
    icon: 'cellphone-check',
    color: ['#3B82F6', '#60A5FA'],
    readingTime: '20 मिनट',
    difficulty: 'मध्यम',
    sectionCount: 4,
    topics: ['फोन चलाना', 'UPI पेमेंट', 'WhatsApp', 'ऑनलाइन सुरक्षा'],
    content: {
      sections: [
        {
          title: 'स्मार्टफोन चलाना सीखें',
          content: `स्मार्टफोन चलाना आसान है। धीरे-धीरे सीखें:

बुनियादी बातें:
• फोन को ऑन-ऑफ कैसे करें
• स्क्रीन को टच कैसे करें
• ऐप्स कैसे खोलें और बंद करें
• वॉल्यूम कैसे बढ़ाएं-घटाएं

कॉल करना:
• फोन ऐप खोलें
• नंबर डायल करें
• हरे बटन पर दबाएं
• लाल बटन से कॉल काटें

मैसेज भेजना:
• मैसेज ऐप खोलें
• नंबर सेलेक्ट करें
• मैसेज टाइप करें
• भेजें बटन दबाएं

सुझाव:
• धीरे-धीरे प्रैक्टिस करें
• डरने की कोई बात नहीं
• परिवार से मदद लें`
        },
        {
          title: 'UPI से पैसे भेजना सीखें',
          content: `UPI से आप फोन से ही पैसे भेज और ले सकते हैं:

UPI क्या है:
• यह एक डिजिटल पेमेंट सिस्टम है
• बैंक अकाउंट से जुड़ा होता है
• 24 घंटे काम करता है
• बहुत सुरक्षित है

UPI कैसे शुरू करें:
• अपने बैंक का ऐप डाउनलोड करें
• मोबाइल नंबर रजिस्टर करें
• UPI PIN बनाएं
• बैंक अकाउंट लिंक करें

पैसे कैसे भेजें:
• रिसीवर का नंबर या UPI ID डालें
• अमाउंट डालें
• UPI PIN डालें
• पैसे भेज दिए गए

सुरक्षा:
• UPI PIN किसी को न बताएं
• गलत नंबर पर पैसे न भेजें
• रसीद जरूर चेक करें`
        },
        {
          title: 'WhatsApp इस्तेमाल करना',
          content: `WhatsApp से आप मैसेज, फोटो और वीडियो भेज सकते हैं:

WhatsApp क्या है:
• यह एक मैसेजिंग ऐप है
• फ्री में मैसेज भेज सकते हैं
• फोटो, वीडियो भी भेज सकते हैं
• वॉयस कॉल भी कर सकते हैं

कैसे इस्तेमाल करें:
• WhatsApp ऐप खोलें
• कॉन्टैक्ट सेलेक्ट करें
• मैसेज टाइप करें
• भेजें बटन दबाएं

फोटो भेजना:
• कैमरा आइकन दबाएं
• फोटो सेलेक्ट करें या नई खींचें
• भेजें बटन दबाएं

सुरक्षा:
• अनजान लोगों से बात न करें
• गलत जानकारी न फैलाएं
• प्राइवेसी सेटिंग चेक करें`
        },
        {
          title: 'ऑनलाइन सुरक्षा',
          content: `इंटरनेट इस्तेमाल करते समय सुरक्षा बहुत जरूरी है:

मुख्य सुरक्षा नियम:
• अपनी जानकारी किसी को न दें
• OTP किसी के साथ शेयर न करें
• पासवर्ड मजबूत रखें
• संदिग्ध लिंक पर क्लिक न करें

फ्रॉड से बचाव:
• बैंक कभी भी OTP नहीं मांगता
• लॉटरी जीतने के मैसेज फेक होते हैं
• अनजान कॉल पर पर्सनल जानकारी न दें
• जल्दबाजी में कुछ न करें

क्या करें अगर फ्रॉड हो:
• तुरंत बैंक को बताएं
• पुलिस में शिकायत करें
• साइबर क्राइम हेल्पलाइन पर कॉल करें
• सबूत इकट्ठे करके रखें

याद रखें:
• अगर कोई चीज सच लगती है तो भी सावधान रहें
• परिवार से सलाह लें
• जल्दबाजी न करें`
        }
      ]
    }
  },
  {
    id: 'health_nutrition_reading',
    title: 'स्वास्थ्य और पोषण',
    subtitle: 'Health & Nutrition Guide',
    description: 'परिवार के स्वास्थ्य की देखभाल के बारे में पढ़ें',
    icon: 'hospital-box',
    color: ['#F59E0B', '#FBBF24'],
    readingTime: '12 मिनट',
    difficulty: 'आसान',
    sectionCount: 4,
    topics: ['संतुलित आहार', 'बच्चों की देखभाल', 'सफाई', 'घरेलू उपचार'],
    content: {
      sections: [
        {
          title: 'संतुलित आहार का महत्व',
          content: `अच्छी सेहत के लिए संतुलित आहार बहुत जरूरी है:

रोज खाने वाली चीजें:
• दाल-चावल जरूर खाएं
• हरी सब्जियां रोज लें
• फल खाना न भूलें
• दूध और दही का सेवन करें
• पानी ज्यादा पिएं

बचने वाली चीजें:
• तली हुई चीजें कम खाएं
• ज्यादा मिठाई न खाएं
• बाहर का खाना कम करें
• ठंडी चीजें कम पिएं

खाने का समय:
• समय पर खाना खाएं
• रात का खाना जल्दी खाएं
• बीच-बीच में कुछ न कुछ खाते रहें
• खाली पेट ज्यादा देर न रहें

फायदे:
• शरीर मजबूत रहता है
• बीमारी कम होती है
• एनर्जी बनी रहती है`
        },
        {
          title: 'बच्चों की सेहत की देखभाल',
          content: `बच्चों की सेहत का खास ख्याल रखना चाहिए:

टीकाकरण:
• जन्म के तुरंत बाद टीके लगवाएं
• समय पर सभी टीके लगवाएं
• टीकाकरण कार्ड संभालकर रखें
• मुफ्त टीके सरकारी अस्पताल में मिलते हैं

बच्चों का खाना:
• 6 महीने तक सिर्फ मां का दूध
• 6 महीने बाद ऊपरी आहार शुरू करें
• दाल का पानी, खिचड़ी दें
• फल का रस दे सकते हैं

सफाई:
• बच्चों को रोज नहलाएं
• साफ कपड़े पहनाएं
• खिलौने साफ रखें
• हाथ धोने की आदत डलवाएं

कब डॉक्टर के पास जाएं:
• तेज बुखार आए
• दस्त-उल्टी हो
• सांस लेने में तकलीफ हो
• खाना-पीना बंद कर दे`
        },
        {
          title: 'सफाई की आदतें',
          content: `सफाई से कई बीमारियों से बचा जा सकता है:

व्यक्तिगत सफाई:
• खाना खाने से पहले हाथ धोएं
• शौच के बाद हाथ जरूर धोएं
• रोज नहाएं
• दांत साफ करें
• नाखून काटकर रखें

घर की सफाई:
• घर को रोज साफ करें
• कूड़ा-कचरा सही जगह फेंकें
• पानी को ढककर रखें
• खाना ढककर रखें
• मक्खी-मच्छर न आने दें

पानी की सफाई:
• पानी को उबालकर पिएं
• साफ बर्तन में पानी रखें
• पानी की टंकी साफ रखें
• बारिश का पानी जमा न होने दें

फायदे:
• बीमारी कम होती है
• पेट की समस्या नहीं होती
• त्वचा की बीमारी नहीं होती`
        },
        {
          title: 'घरेलू उपचार',
          content: `छोटी-मोटी बीमारियों के लिए घरेलू उपचार कर सकते हैं:

खांसी-जुकाम:
• शहद और अदरक का मिश्रण लें
• गर्म पानी से गरारे करें
• भाप लें
• गर्म पानी पिएं

बुखार:
• ठंडी पट्टी माथे पर रखें
• ज्यादा पानी पिएं
• आराम करें
• हल्का खाना खाएं

पेट दर्द:
• हींग का पानी पिएं
• पेट पर हल्की मालिश करें
• गर्म पानी की बोतल रखें
• हल्का खाना खाएं

सिर दर्द:
• तेल की मालिश करें
• आराम करें
• पानी ज्यादा पिएं
• तनाव न लें

सावधानी:
• ज्यादा परेशानी हो तो डॉक्टर के पास जाएं
• बच्चों को कोई भी दवा देने से पहले डॉक्टर से पूछें
• घरेलू नुस्खे सावधानी से करें`
        }
      ]
    }
  },
  {
    id: 'womens_rights_reading',
    title: 'महिला अधिकार',
    subtitle: 'Women\'s Rights Guide',
    description: 'अपने अधिकार और सुरक्षा के बारे में पढ़ें',
    icon: 'scale-balance',
    color: ['#8B5CF6', '#A78BFA'],
    readingTime: '18 मिनट',
    difficulty: 'मध्यम',
    sectionCount: 4,
    topics: ['कानूनी अधिकार', 'घरेलू हिंसा', 'हेल्पलाइन नंबर', 'आर्थिक स्वतंत्रता'],
    content: {
      sections: [
        {
          title: 'महिलाओं के कानूनी अधिकार',
          content: `हर महिला के कुछ कानूनी अधिकार हैं जिन्हें जानना जरूरी है:

मुख्य अधिकार:
• शिक्षा का अधिकार - पढ़ने का पूरा हक
• काम करने का अधिकार - कोई भी काम कर सकती हैं
• संपत्ति में हिस्सा - पैतृक संपत्ति में बराबर का हक
• वोट देने का अधिकार - अपनी पसंद का नेता चुन सकती हैं

विवाह के अधिकार:
• 18 साल से पहले शादी नहीं हो सकती
• जबरदस्ती शादी नहीं हो सकती
• दहेज लेना-देना गुनाह है
• तलाक का भी अधिकार है

काम के अधिकार:
• बराबर वेतन का हक
• मातृत्व अवकाश का हक
• सुरक्षित काम करने का माहौल
• यौन उत्पीड़न के खिलाफ सुरक्षा

याद रखें:
• अपने अधिकारों को जानें
• जरूरत पड़ने पर कानूनी मदद लें
• महिला हेल्पलाइन का नंबर याद रखें`
        },
        {
          title: 'घरेलू हिंसा से बचाव',
          content: `घरेलू हिंसा गलत है और इसके खिलाफ कानून है:

घरेलू हिंसा क्या है:
• मारपीट करना
• गाली-गलौच करना
• पैसे न देना
• घर से निकालना
• धमकी देना

यह सब गुनाह है:
• पति का कोई हक नहीं मारने का
• ससुराल वाले भी नहीं मार सकते
• यह कानूनी अपराध है
• जेल की सजा हो सकती है

आप अकेली नहीं हैं:
• मदद मांगना गलत नहीं
• पुलिस आपकी मदद करेगी
• कानून आपके साथ है
• कई संस्थाएं मदद करती हैं

क्या करें:
• 181 नंबर पर कॉल करें
• भरोसेमंद लोगों से बात करें
• सबूत इकट्ठे करके रखें
• डरें नहीं, हिम्मत रखें`
        },
        {
          title: 'जरूरी हेल्पलाइन नंबर',
          content: `मुसीबत में ये नंबर आपकी मदद कर सकते हैं:

महिला हेल्पलाइन:
• 181 - महिला हेल्पलाइन (24 घंटे)
• 1091 - महिला पावर लाइन
• 1098 - चाइल्ड हेल्पलाइन
• 1076 - वन स्टॉप सेंटर

आपातकालीन नंबर:
• 100 - पुलिस
• 102 - एम्बुलेंस
• 101 - फायर ब्रिगेड
• 108 - आपातकालीन सेवा

अन्य जरूरी नंबर:
• 155620 - महिला हेल्पलाइन (रेलवे)
• 14420 - साइबर क्राइम हेल्पलाइन
• 1930 - साइबर फ्रॉड हेल्पलाइन

याद रखें:
• ये नंबर अपने फोन में सेव करें
• 24 घंटे मदद मिलती है
• हिंदी में बात कर सकते हैं
• कॉल फ्री है, पैसे नहीं लगते`
        },
        {
          title: 'आर्थिक स्वतंत्रता',
          content: `आर्थिक स्वतंत्रता से आप मजबूत बनती हैं:

क्यों जरूरी है:
• अपने फैसले खुद ले सकती हैं
• परिवार की बेहतर मदद कर सकती हैं
• आत्मविश्वास बढ़ता है
• समाज में सम्मान मिलता है

कैसे शुरू करें:
• अपना बैंक अकाउंट खोलें
• छोटा-मोटा काम शुरू करें
• पैसे बचाने की आदत डालें
• सरकारी योजनाओं का फायदा उठाएं

काम के विकल्प:
• सिलाई, कढ़ाई सीखें
• खाना बनाकर बेचें
• ट्यूशन पढ़ाएं
• घर से ही काम शुरू करें

मदद कहां मिलेगी:
• SHG (स्वयं सहायता समूह) से जुड़ें
• मुद्रा लोन के बारे में पूछें
• स्किल डेवलपमेंट कोर्स करें
• महिला उद्यमी योजनाओं की जानकारी लें

सुझाव:
• धीरे-धीरे शुरू करें
• परिवार का साथ लें
• ईमानदारी से काम करें
• हिम्मत न हारें`
        }
      ]
    }
  }
];

export default function ModuleLearningCategoriesScreen({ navigation }) {
  const { profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      const welcomeMessage = 'पढ़कर सीखने के लिए कोई भी विषय चुनें। सभी जानकारी आसान भाषा में है।';
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

    // Navigate to module learning screen with selected category
    navigation.navigate('ModuleLearning', {
      moduleData: category
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>मॉड्यूल से सीखें</Text>
      <Text style={styles.headerSubtitle}>Module Learning Categories</Text>
      <Text style={styles.headerDescription}>
        अपनी पसंद का विषय चुनें और पढ़कर सीखें
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
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 4 }} />
              <Text style={styles.statText}>{category.sectionCount} भाग</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 4 }} />
              <Text style={styles.statText}>{category.readingTime}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 4 }} />
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
            <Text style={styles.actionText}>पढ़ना शुरू करें →</Text>
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
          {MODULE_LEARNING_CATEGORIES.map((category, index) =>
            renderCategoryCard(category, index)
          )}
        </View>

        {/* Voice Control */}
        <View style={styles.voiceSection}>
          <Pressable
            style={styles.voiceButton}
            onPress={() => speakText('ये सभी जानकारी आपकी मदद के लिए है। कोई भी विषय चुनकर पढ़ना शुरू करें।')}
            disabled={isPlaying}
          >
            <LinearGradient
              colors={['#8B7355', '#A67C52']}
              style={styles.voiceGradient}
            >
              <MaterialCommunityIcons name="volume-high" size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
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
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  categoryWrapper: {
    marginBottom: SPACING.sm,
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
    padding: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  categorySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
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
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  topicsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  topicsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  topicsList: {
    gap: SPACING.xs,
  },
  topicItem: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  categoryAction: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
export { MODULE_LEARNING_CATEGORIES };