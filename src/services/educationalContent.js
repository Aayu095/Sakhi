// Enhanced Educational Content System for Women's Literacy
// Aligned with Bridging The Gap Hackathon Theme

export const LITERACY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced'
};

export const LEARNING_CATEGORIES = {
  DIGITAL_LITERACY: 'digital_literacy',
  FUNCTIONAL_LITERACY: 'functional_literacy',
  HEALTH_EDUCATION: 'health_education',
  FINANCIAL_LITERACY: 'financial_literacy',
  LIFE_SKILLS: 'life_skills'
};

// Comprehensive Educational Modules
export const EDUCATIONAL_MODULES = [
  {
    id: 'digital_basics',
    category: LEARNING_CATEGORIES.DIGITAL_LITERACY,
    title: 'डिजिटल साक्षरता की शुरुआत',
    subtitle: 'Digital Literacy Basics',
    description: 'फोन और इंटरनेट का सुरक्षित उपयोग सीखें',
    icon: 'cellphone',
    color: ['#4F46E5', '#7C3AED'],
    difficulty: LITERACY_LEVELS.BEGINNER,
    estimatedTime: '30 मिनट',
    prerequisites: [],
    learningObjectives: [
      'फोन की ब��सिक जानकारी',
      'इंटरनेट का सुरक्षित उपयोग',
      'डिजिटल फ्रॉड से बचाव',
      'UPI और ऑनलाइन पेमेंट'
    ],
    lessons: [
      {
        id: 'phone_basics',
        title: 'फोन की बुनियादी बातें',
        duration: '8 मिनट',
        type: 'interactive',
        content: {
          introduction: 'आज हम सीखेंगे कि फोन कैसे इस्तेमाल करते हैं।',
          keyPoints: [
            'फोन चालू/बंद करना',
            'कॉल करना और रिसीव करना', 
            'SMS भेजना',
            'कैमरा का उपयोग'
          ],
          practiceExercises: [
            'अपना नाम टाइप करके SMS भेजें',
            'एक फोटो खींचें',
            'कॉन्टैक्ट लिस्ट में नाम सेव करें'
          ]
        }
      },
      {
        id: 'internet_safety',
        title: 'इंटरनेट की सुरक्षा',
        duration: '10 मिनट',
        type: 'interactive',
        content: {
          introduction: 'इंटरनेट का सुरक्षित उपयोग कैसे करें।',
          keyPoints: [
            'WiFi और Mobile Data',
            'सुरक्षित वेबसाइट पहचानना',
            'व्यक्तिगत जानकारी की सुरक्षा',
            'फेक न्यूज़ से बचाव'
          ],
          practiceExercises: [
            'सुरक्षित वेबसाइट खोलना',
            'व्यक्तिगत जानकारी छुपाना',
            'फेक न्यूज़ की पहचान करना'
          ]
        }
      },
      {
        id: 'digital_payments',
        title: 'डिजिटल पेमेंट और UPI',
        duration: '12 मिनट',
        type: 'hands_on',
        content: {
          introduction: 'UPI और ऑनलाइन पेमेंट का सुरक्षित उपयोग।',
          keyPoints: [
            'UPI ऐप इंस्टॉल करना',
            'बैंक अकाउंट लिंक करना',
            'QR कोड स्कैन करना',
            'पेमेंट की पुष्टि करना'
          ],
          practiceExercises: [
            'UPI PIN सेट करना',
            'डेमो पेमेंट करना',
            'ट्रांजैक्शन हिस्ट्री देखना'
          ]
        }
      }
    ],
    assessment: {
      preTest: [
        'क्या आपने पहले फोन इस्तेमाल किया है?',
        'क्या आप इंटरनेट के बारे में जानती हैं?',
        'क्या आपका बैंक अकाउंट है?'
      ],
      postTest: [
        'फोन में कॉन्टैक्ट कैसे सेव करते हैं?',
        'UPI से पेमेंट कैसे करते हैं?',
        'फेक कॉल की पहचान कैसे करें?'
      ]
    }
  },
  
  {
    id: 'functional_literacy',
    category: LEARNING_CATEGORIES.FUNCTIONAL_LITERACY,
    title: 'पढ़ना-लिखना सीखें',
    subtitle: 'Basic Reading & Writing',
    description: 'हिंदी और अंग्रेजी में बुनियादी पढ़ना-लिखना',
    icon: 'pencil',
    color: ['#059669', '#10B981'],
    difficulty: LITERACY_LEVELS.BEGINNER,
    estimatedTime: '45 मिनट',
    prerequisites: [],
    learningObjectives: [
      'हिंदी वर्णमाला की पहचान',
      'सरल शब्द पढ़ना',
      'अपना नाम लिखना',
      'बुनियादी अंग्रेजी शब्द'
    ],
    lessons: [
      {
        id: 'hindi_alphabets',
        title: 'हिंदी वर्णमाला',
        duration: '15 मिनट',
        type: 'interactive',
        content: {
          introduction: 'आइए हिंदी के अक्षरों को सीखते हैं।',
          keyPoints: [
            'स्वर - अ, आ, इ, ई...',
            'व्यंजन - क, ख, ग, घ...',
            'मात्राएं',
            'संयुक्त अक्षर'
          ],
          practiceExercises: [
            'अक्षरों को पहचानना',
            'सरल शब्द बनाना',
            'अपना नाम लिखना'
          ]
        }
      },
      {
        id: 'basic_reading',
        title: 'सरल वाक्य पढ़ना',
        duration: '15 मिनट',
        type: 'practice',
        content: {
          introduction: 'अब हम छोटे वाक्य पढ़ना सीखेंगे।',
          keyPoints: [
            'दो अक्षर के शब्द',
            'तीन अक्षर के शब्द',
            'सरल वाक्य',
            'दैनिक उपयोग के शब्द'
          ],
          practiceExercises: [
            'शब्दों को जोड़कर पढ़ना',
            'वाक्य पूरा करना',
            'कहानी पढ़ना'
          ]
        }
      },
      {
        id: 'basic_english',
        title: 'बुनियादी अंग्रेजी',
        duration: '15 मिनट',
        type: 'interactive',
        content: {
          introduction: 'रोजमर्रा के अंग्रेजी शब्द सीखें।',
          keyPoints: [
            'A-Z अक्षर',
            'संख्याएं 1-10',
            'रंगों के नाम',
            'परिवार के सदस्य'
          ],
          practiceExercises: [
            'अंग्रेजी अक्षर लिखना',
            'सरल शब्द बोलना',
            'नाम अंग्रेजी में लिखना'
          ]
        }
      }
    ]
  },

  {
    id: 'health_education',
    category: LEARNING_CATEGORIES.HEALTH_EDUCATION,
    title: 'स्वास्थ्य शिक्षा',
    subtitle: 'Health & Hygiene Education',
    description: 'महिलाओं के लिए जरूरी स्वास्थ्य जानकारी',
    icon: 'hospital-box',
    color: ['#DC2626', '#EF4444'],
    difficulty: LITERACY_LEVELS.BEGINNER,
    estimatedTime: '40 मिनट',
    prerequisites: [],
    learningObjectives: [
      'महावारी की सही जानकारी',
      'पोषण और खाना',
      'गर्भावस्था की देखभाल',
      'बच्चों का स्वास्थ्य'
    ],
    lessons: [
      {
        id: 'menstrual_health',
        title: 'महावारी और स्वच्छता',
        duration: '15 मिनट',
        type: 'educational',
        content: {
          introduction: 'महावारी के बारे में सही और पूरी जानकारी।',
          keyPoints: [
            'महावारी क्या है और क्यों होती है',
            'सैनिटरी पैड का सही उपयोग',
            'सफाई के तरीके',
            'मिथकों को तोड़ना'
          ],
          practiceExercises: [
            'पैड बदलने का सही तरीका',
            'सफाई के नियम',
            'दर्द से राहत के उपाय'
          ]
        }
      },
      {
        id: 'nutrition_basics',
        title: 'पोषण और खाना',
        duration: '12 मिनट',
        type: 'practical',
        content: {
          introduction: 'संतुलित आहार और पोषण की जानकारी।',
          keyPoints: [
            'संतुलित आहार क्या है',
            'आयरन के स्रोत',
            'गर्भावस्था में खाना',
            'बच्चों का पोषण'
          ],
          practiceExercises: [
            'दै���िक आहार की योजना',
            'पोषक तत्वों की पहचान',
            'घरेलू नुस्खे'
          ]
        }
      },
      {
        id: 'pregnancy_care',
        title: 'गर्भावस्था की देखभाल',
        duration: '13 मिनट',
        type: 'educational',
        content: {
          introduction: 'गर्भावस्था के दौरान सही देखभाल।',
          keyPoints: [
            'नियमित जांच का महत्व',
            'खाने में सावधानी',
            'व्यायाम और आराम',
            'खतरे के संकेत'
          ],
          practiceExercises: [
            'डॉक्टर से कब मिलें',
            'जरूरी टेस्ट की जानकारी',
            'आपातकाल में क्या करें'
          ]
        }
      }
    ]
  },

  {
    id: 'financial_literacy',
    category: LEARNING_CATEGORIES.FINANCIAL_LITERACY,
    title: 'वित्तीय साक्षरता',
    subtitle: 'Financial Literacy',
    description: 'पैसे की समझ और बैंकिंग की ज���नकारी',
    icon: 'cash-multiple',
    color: ['#7C2D12', '#EA580C'],
    difficulty: LITERACY_LEVELS.INTERMEDIATE,
    estimatedTime: '35 मिनट',
    prerequisites: ['digital_basics'],
    learningObjectives: [
      'बैंक खाता खोलना',
      'बचत की आदत',
      'सरकारी योजनाओं की जानकारी',
      'छोटा व्यवसाय शुरू करना'
    ],
    lessons: [
      {
        id: 'banking_basics',
        title: 'बैंकिंग की बुनियादी बातें',
        duration: '12 मिनट',
        type: 'practical',
        content: {
          introduction: 'बैंक खाता और उसके फायदे।',
          keyPoints: [
            'बैंक खाता क्यों जरूरी है',
            'खाता खोलने के लिए जरूरी कागजात',
            'ATM का उपयोग',
            'पासबुक की जानकारी'
          ],
          practiceExercises: [
            'बैंक फॉर्म भरना',
            'ATM से पैसे निकालना',
            'बैलेंस चेक करना'
          ]
        }
      },
      {
        id: 'savings_planning',
        title: 'बचत और योजना',
        duration: '10 मिनट',
        type: 'interactive',
        content: {
          introduction: 'पैसे की बचत कैसे करें।',
          keyPoints: [
            'मासिक बजट बनाना',
            'जरूरी और गैर-जरूरी खर्च',
            'बचत के तरीके',
            'आपातकाल के लिए फंड'
          ],
          practiceExercises: [
            'अपना बजट बनाना',
            'खर्च का हिसाब रखना',
            'बचत का लक्ष्य तय करना'
          ]
        }
      },
      {
        id: 'govt_schemes',
        title: 'सरकारी योजनाएं',
        duration: '13 मिनट',
        type: 'informational',
        content: {
          introduction: 'महिलाओं के लिए सरकारी योजनाएं।',
          keyPoints: [
            'जन धन योजना',
            'उज्ज्वला योजना',
            'आयुष्मान भारत',
            'मुद्रा लोन योज��ा'
          ],
          practiceExercises: [
            'योजना के लिए आवेदन',
            'जरूरी दस्तावेज तैयार करना',
            'ऑनलाइन आवेदन प्रक्रिया'
          ]
        }
      }
    ]
  }
];

// Learning Progress Tracking
export const PROGRESS_METRICS = {
  LESSON_COMPLETION: 'lesson_completion',
  QUIZ_SCORES: 'quiz_scores', 
  PRACTICE_EXERCISES: 'practice_exercises',
  TIME_SPENT: 'time_spent',
  SKILL_ASSESSMENT: 'skill_assessment'
};

// Achievement System for Educational Progress
export const EDUCATIONAL_ACHIEVEMENTS = [
  {
    id: 'first_lesson_complete',
    title: 'पहला कदम',
    description: 'पहला पाठ पूरा किया',
    icon: 'target',
    category: 'milestone',
    condition: (progress) => progress.lessonsCompleted >= 1
  },
  {
    id: 'digital_literacy_master',
    title: 'डिजिटल गुरु',
    description: 'डिजिटल साक्षरता मॉड्यूल पूरा किया',
    icon: 'cellphone',
    category: 'completion',
    condition: (progress) => progress.modulesCompleted.includes('digital_basics')
  },
  {
    id: 'reading_champion',
    title: 'पढ़ने की चैंपिय���',
    description: 'पढ़ना-लिखना मॉड्यूल पूरा किया',
    icon: 'book-multiple',
    category: 'completion',
    condition: (progress) => progress.modulesCompleted.includes('functional_literacy')
  },
  {
    id: 'health_aware',
    title: 'स्वास्थ्य जागरूक',
    description: 'स्वास्थ्य शिक्षा मॉड्यूल पूरा किया',
    icon: 'hospital-box',
    category: 'completion',
    condition: (progress) => progress.modulesCompleted.includes('health_education')
  },
  {
    id: 'financial_smart',
    title: 'वित्तीय समझदार',
    description: 'वित्तीय साक्षरता मॉड्यूल पूरा किया',
    icon: 'cash-multiple',
    category: 'completion',
    condition: (progress) => progress.modulesCompleted.includes('financial_literacy')
  },
  {
    id: 'all_modules_complete',
    title: 'सर्वज्ञ दीदी',
    description: 'सभी मॉड्यूल पूरे किए',
    icon: 'crown',
    category: 'mastery',
    condition: (progress) => progress.modulesCompleted.length >= 4
  }
];

// Assessment Questions for Different Modules
export const ASSESSMENT_QUESTIONS = {
  digital_basics: {
    preAssessment: [
      {
        question: 'क्या आपने पहले स्मार्टफोन इस्तेमाल किया है?',
        options: ['हां, रोज इस्तेमाल करती हूं', 'कभी-कभी', 'बिल्कुल नहीं'],
        type: 'multiple_choice'
      },
      {
        question: 'UPI के बारे में आप कितना जानती हैं?',
        options: ['बहुत अच्छी तरह', 'थोड़ा बहुत', 'बिल्कुल नहीं'],
        type: 'multiple_choice'
      }
    ],
    postAssessment: [
      {
        question: 'UPI से पेमेंट करने के लिए सबसे जरूरी चीज क्या है?',
        options: ['UPI PIN', 'आधार कार्ड', 'पैन कार्ड'],
        correctAnswer: 0,
        type: 'quiz'
      },
      {
        question: 'फेक कॉल की पहचान कैसे करें?',
        options: ['OTP मांगे तो तुरंत दें', 'व्यक्तिगत जानकारी न दें', 'सभी कॉल का जवाब दें'],
        correctAnswer: 1,
        type: 'quiz'
      }
    ]
  }
};

// Learning Analytics
export function calculateLearningProgress(userProgress) {
  const totalModules = EDUCATIONAL_MODULES.length;
  const completedModules = userProgress.modulesCompleted?.length || 0;
  const totalLessons = EDUCATIONAL_MODULES.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedLessons = userProgress.lessonsCompleted || 0;
  
  return {
    moduleProgress: (completedModules / totalModules) * 100,
    lessonProgress: (completedLessons / totalLessons) * 100,
    overallProgress: ((completedModules * 0.7) + (completedLessons / totalLessons * 0.3)) * 100,
    nextRecommendation: getNextRecommendation(userProgress)
  };
}

function getNextRecommendation(userProgress) {
  const completedModules = userProgress.modulesCompleted || [];
  const availableModules = EDUCATIONAL_MODULES.filter(module => 
    !completedModules.includes(module.id) &&
    module.prerequisites.every(prereq => completedModules.includes(prereq))
  );
  
  return availableModules.length > 0 ? availableModules[0] : null;
}