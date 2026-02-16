import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import GradientBackground from '../components/GradientBackground';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

export default function CommunityScreen({ navigation }) {
  const { profile, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('feed');
  const [communityData, setCommunityData] = useState({
    peers: [],
    successStories: [],
    helpRequests: [],
    studyGroups: [],
    mentors: []
  });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [userCommunityProfile, setUserCommunityProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load data immediately without waiting for user/profile
    loadCommunityData();
    loadUserCommunityProfile();
  }, []);

  const loadCommunityData = async () => {
    try {
      // Load mock data immediately
      const mockSuccessStories = [
        {
          id: 'story1',
          title: 'मैंने UPI सीखकर अपना बिजनेस बढ़ाया',
          content: 'दीदी के साथ सीखकर मैंने डिजिटल पेमेंट का उपयोग करना सीखा। अब मेरे ग्राहक आसानी से पेमेंट कर सकते हैं।',
          category: 'digital_literacy',
          likes: 25,
          comments: [],
          createdAt: Date.now() - 86400000
        },
        {
          id: 'story2',
          title: 'पढ़ना-लिखना सीखकर मैं आत्मनिर्भर बनी',
          content: 'अब मैं अपने बच्चों के स्कूल के फॉर्म खुद भर सकती हूं। बहुत खुशी की बात है।',
          category: 'functional_literacy',
          likes: 18,
          comments: [],
          createdAt: Date.now() - 172800000
        },
        {
          id: 'story3',
          title: 'स्वास्थ्य की जानकारी से बदली मेरी जिंदगी',
          content: 'दीदी से सीखकर मैंने अपने और अपने परिवार के स्वास्थ्य का बेहतर ख्याल रखना सीखा।',
          category: 'health_education',
          likes: 32,
          comments: [],
          createdAt: Date.now() - 259200000
        }
      ];

      const mockPeers = [
        {
          id: 'peer1',
          displayName: 'सुनीता दीदी',
          location: { district: 'लखनऊ', state: 'उत्तर प्रदेश' },
          learningGoals: ['डिजिटल साक्षरता', 'स्वास्थ्य शिक्षा'],
          completedModules: ['digital_basics'],
          communityStats: { reputationScore: 45 },
          compatibility: 85
        },
        {
          id: 'peer2',
          displayName: 'प्रिया बहन',
          location: { district: 'कानपुर', state: 'उत्तर प्रदेश' },
          learningGoals: ['वित्तीय साक्षरता', 'पढ़ना-लिखना'],
          completedModules: ['functional_literacy'],
          communityStats: { reputationScore: 32 },
          compatibility: 78
        },
        {
          id: 'peer3',
          displayName: 'अनीता जी',
          location: { district: 'आगरा', state: 'उत्तर प्रदेश' },
          learningGoals: ['स्वास्थ्य शिक्षा', 'डिजिटल साक्षरता'],
          completedModules: ['health_education'],
          communityStats: { reputationScore: 58 },
          compatibility: 92
        }
      ];

      setCommunityData({
        successStories: mockSuccessStories,
        peers: mockPeers,
        helpRequests: [],
        studyGroups: [],
        mentors: []
      });
      
    } catch (error) {
      console.error('Error loading community data:', error);
    }
  };

  const loadUserCommunityProfile = async () => {
    try {
      // Create mock community profile using available user data
      const mockCommunityProfile = {
        userId: user?.uid || 'demo_user',
        displayName: profile?.name || user?.displayName || 'दीदी की सहेली',
        communityStats: {
          reputationScore: 25,
          helpGiven: 2,
          storiesShared: 1,
          questionsAnswered: 3
        }
      };
      
      setUserCommunityProfile(mockCommunityProfile);
    } catch (error) {
      console.error('Error loading user community profile:', error);
    }
  };

  const handleRequestHelp = async (helpData) => {
    try {
      setShowHelpModal(false);
      Alert.alert('सफलता', 'आपकी मदद की अनुरोध भेज दी गई है। जल्द ही कोई आपकी मदद करेगा।');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('त्रुटि', 'मदद की अनुरोध भेजने में समस्या हुई।');
    }
  };

  const handleShareStory = async (storyData) => {
    try {
      setShowStoryModal(false);
      Alert.alert('धन्यवाद', 'आपकी सफलता की कहानी साझा कर दी गई है। यह दूसरों को प्रेरणा देगी।');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Add to local state for immediate feedback
      const newStory = {
        id: `story_${Date.now()}`,
        title: storyData.title,
        content: storyData.content,
        category: storyData.category,
        likes: 0,
        comments: [],
        createdAt: Date.now()
      };
      
      setCommunityData(prev => ({
        ...prev,
        successStories: [newStory, ...prev.successStories]
      }));
    } catch (error) {
      Alert.alert('त्रुटि', 'कहानी साझा करने में समस्या हुई।');
    }
  };

  const renderFeedTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Community Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>समुदाय में आपकी स्थिति</Text>
        {userCommunityProfile && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userCommunityProfile.communityStats.reputationScore}</Text>
              <Text style={styles.statLabel}>प्रतिष्ठा</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userCommunityProfile.communityStats.helpGiven}</Text>
              <Text style={styles.statLabel}>मदद की</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userCommunityProfile.communityStats.storiesShared}</Text>
              <Text style={styles.statLabel}>कहानियां</Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>समुदाय में भाग लें</Text>
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={() => setShowHelpModal(true)}>
            <Text style={styles.actionIcon}>🤝</Text>
            <Text style={styles.actionText}>मदद मांगें</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setShowStoryModal(true)}>
            <Text style={styles.actionIcon}>✨</Text>
            <Text style={styles.actionText}>कहानी साझा करें</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setSelectedTab('mentors')}>
            <Text style={styles.actionIcon}>👩‍🏫</Text>
            <Text style={styles.actionText}>मेंटर खोजें</Text>
          </Pressable>
        </View>
      </View>

      {/* Success Stories */}
      <View style={styles.storiesSection}>
        <Text style={styles.sectionTitle}>🌟 सफलता की कहानियां</Text>
        {communityData.successStories.map((story, index) => (
          <View key={story.id} 
            delay={index * 100}
            style={styles.storyCard}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyDate}>
                {new Date(story.createdAt).toLocaleDateString('hi-IN')}
              </Text>
            </View>
            <Text style={styles.storyContent} numberOfLines={3}>
              {story.content}
            </Text>
            <View style={styles.storyFooter}>
              <Text style={styles.storyCategory}>#{story.category}</Text>
              <View style={styles.storyStats}>
                <Text style={styles.storyStat}>👍 {story.likes}</Text>
                <Text style={styles.storyStat}>💬 {story.comments.length}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPeersTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.peersSection}>
        <Text style={styles.sectionTitle}>👭 आपके जैसी सहेलियां</Text>
        <Text style={styles.sectionDesc}>
          अपने आस-पास की महिलाओं से जुड़ें और एक साथ सीखें
        </Text>
        {communityData.peers.map((peer, index) => (
          <View key={peer.id} 
            delay={index * 150}
            style={styles.peerCard}
          >
            <View style={styles.peerHeader}>
              <Text style={styles.peerName}>{peer.displayName}</Text>
              <Text style={styles.compatibilityScore}>
                {Math.round(peer.compatibility)}% मैच
              </Text>
            </View>
            <Text style={styles.peerLocation}>
              📍 {peer.location.district}, {peer.location.state}
            </Text>
            <View style={styles.peerGoals}>
              {peer.learningGoals.slice(0, 3).map((goal, idx) => (
                <Text key={idx} style={styles.goalTag}>#{goal}</Text>
              ))}
            </View>
            <View style={styles.peerStats}>
              <Text style={styles.peerStat}>
                📚 {peer.completedModules.length} मॉड्यूल पूरे
              </Text>
              <Text style={styles.peerStat}>
                ⭐ {peer.communityStats.reputationScore} प्रतिष्ठा
              </Text>
            </View>
            <Pressable 
              style={styles.connectButton}
              onPress={() => Alert.alert('जल्द आ रहा है', 'यह फीचर जल्द ही उपलब्ध होगा।')}
            >
              <Text style={styles.connectButtonText}>जुड़ें</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMentorsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.mentorsSection}>
        <Text style={styles.sectionTitle}>👩‍🏫 मेंटर्स</Text>
        <Text style={styles.sectionDesc}>
          अनुभवी दीदियों से सीखें और मार्गदर्शन पाएं
        </Text>
        
        {/* Mock mentors */}
        <View style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <Text style={styles.mentorName}>प्रिया दीदी</Text>
            <Text style={styles.mentorRating}>⭐ 4.8</Text>
          </View>
          <Text style={styles.mentorExpertise}>
            विशेषज्ञता: डिजिटल पे��ेंट, बैंकिंग, सरकारी योजनाएं
          </Text>
          <Text style={styles.mentorExperience}>
            5 साल का अनुभव • 50+ महिलाओं की मदद की
          </Text>
          <Pressable 
            style={styles.mentorButton}
            onPress={() => Alert.alert('जल्द आ रहा है', 'मेंटर कनेक्शन फीचर जल्द ही उपलब्ध होगा।')}
          >
            <Text style={styles.mentorButtonText}>मेंटर से जुड़ें</Text>
          </Pressable>
        </View>

        <View style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <Text style={styles.mentorName}>सुनीता दीदी</Text>
            <Text style={styles.mentorRating}>⭐ 4.9</Text>
          </View>
          <Text style={styles.mentorExpertise}>
            विशेषज्ञता: पढ़ना-लिखना, अंग्रेजी, बच्चों की शिक्षा
          </Text>
          <Text style={styles.mentorExperience}>
            3 साल का अनुभव • 30+ महिलाओं की मदद की
          </Text>
          <Pressable 
            style={styles.mentorButton}
            onPress={() => Alert.alert('जल्द आ रहा है', 'मेंटर कनेक्शन फीचर जल्द ही उपलब्ध होगा।')}
          >
            <Text style={styles.mentorButtonText}>मेंटर से जुड़ें</Text>
          </Pressable>
        </View>

        <View style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <Text style={styles.mentorName}>अनीता जी</Text>
            <Text style={styles.mentorRating}>⭐ 4.7</Text>
          </View>
          <Text style={styles.mentorExpertise}>
            विशेषज्ञता: स्वास्थ्य शिक्षा, पोषण, मातृत्व देखभाल
          </Text>
          <Text style={styles.mentorExperience}>
            4 साल का अनुभव • 40+ महिलाओं की मदद की
          </Text>
          <Pressable 
            style={styles.mentorButton}
            onPress={() => Alert.alert('जल्द आ रहा है', 'मेंटर कनेक्शन फीचर जल्द ही उपलब्ध होगा।')}
          >
            <Text style={styles.mentorButtonText}>मेंटर से जुड़ें</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );

  const renderHelpModal = () => (
    <Modal visible={showHelpModal} animationType="slide" onRequestClose={() => setShowHelpModal(false)}>
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>मदद मांगें</Text>
            <Pressable onPress={() => setShowHelpModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          
          <HelpRequestForm onSubmit={handleRequestHelp} />
        </ScrollView>
      </GradientBackground>
    </Modal>
  );

  const renderStoryModal = () => (
    <Modal visible={showStoryModal} animationType="slide" onRequestClose={() => setShowStoryModal(false)}>
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>सफलता की कहानी साझा करें</Text>
            <Pressable onPress={() => setShowStoryModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          
          <SuccessStoryForm onSubmit={handleShareStory} />
        </ScrollView>
      </GradientBackground>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>समुदाय</Text>
          <Text style={styles.headerSubtitle}>Community Learning</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, selectedTab === 'feed' && styles.activeTab]}
            onPress={() => setSelectedTab('feed')}
          >
            <Text style={[styles.tabText, selectedTab === 'feed' && styles.activeTabText]}>
              फीड
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, selectedTab === 'peers' && styles.activeTab]}
            onPress={() => setSelectedTab('peers')}
          >
            <Text style={[styles.tabText, selectedTab === 'peers' && styles.activeTabText]}>
              सहेलियां
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, selectedTab === 'mentors' && styles.activeTab]}
            onPress={() => setSelectedTab('mentors')}
          >
            <Text style={[styles.tabText, selectedTab === 'mentors' && styles.activeTabText]}>
              मेंटर्स
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {selectedTab === 'feed' && renderFeedTab()}
          {selectedTab === 'peers' && renderPeersTab()}
          {selectedTab === 'mentors' && renderMentorsTab()}
        </View>
      </View>

      {renderHelpModal()}
      {renderStoryModal()}
    </GradientBackground>
  );
}

// Help Request Form Component
function HelpRequestForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('learning');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('त्रुटि', 'कृपया सभी फील्ड भरें।');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      urgency: 'medium',
      tags: [category]
    });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formLabel}>मदद का विषय</Text>
      <TextInput
        style={styles.formInput}
        placeholder="जैसे: UPI से पेमेंट कैसे करें?"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.formLabel}>विस्तार से बताएं</Text>
      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="अपनी समस्या के बारे में विस्तार से लिखें..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.formLabel}>श्रेणी</Text>
      <View style={styles.categoryButtons}>
        {['learning', 'technical', 'practical'].map(cat => (
          <Pressable
            key={cat}
            style={[styles.categoryButton, category === cat && styles.selectedCategory]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.selectedCategoryText]}>
              {cat === 'learning' ? 'सीखना' : cat === 'technical' ? 'तकनीकी' : 'व्यावहारिक'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>मदद मांगें</Text>
      </Pressable>
    </View>
  );
}

// Success Story Form Component
function SuccessStoryForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('learning');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('त्रुटि', 'कृपया सभी फील्ड भरें।');
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: [category]
    });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formLabel}>कहानी का शीर्षक</Text>
      <TextInput
        style={styles.formInput}
        placeholder="जैसे: मैंने UPI सीखकर अपना बिजनेस बढ़���या"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.formLabel}>अपनी कहानी</Text>
      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="बताएं कि आपने क्या सीखा और इससे आपकी जिंदगी कैसे बदली..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
      />

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>कहानी साझा करें</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary[500],
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  // Feed Tab Styles
  statsCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  actionsCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  storiesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  sectionDesc: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  storyTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  storyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  storyContent: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyCategory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  storyStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  storyStat: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  // Peers Tab Styles
  peersSection: {
    marginBottom: SPACING.lg,
  },
  peerCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  peerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  peerName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  compatibilityScore: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.status.success,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  peerLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  peerGoals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  goalTag: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary[600],
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  peerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  peerStat: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  connectButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Mentors Tab Styles
  mentorsSection: {
    marginBottom: SPACING.lg,
  },
  mentorCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mentorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mentorName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  mentorRating: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.status.warning,
  },
  mentorExpertise: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  mentorExperience: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  mentorButton: {
    backgroundColor: COLORS.secondary[500],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  mentorButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.primary,
  },
  // Form Styles
  formContainer: {
    marginBottom: SPACING.xl,
  },
  formLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  formInput: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});