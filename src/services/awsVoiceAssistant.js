import { CONFIG } from '../config/config';

/**
 * Voice assistant client for Sakhi's Bedrock-backed conversations.
 */
class AwsVoiceAssistant {
    constructor() {
        this.conversationHistory = [];
        this.currentTopic = 'general';
        this.sessionId = null;
        this.apiBaseUrl = CONFIG.AWS.apiGatewayUrl;
    }

    setTopic(topic) {
        this.currentTopic = topic;
    }

    setUserProfile(profile) {
        this.userProfile = profile;
    }

    async post(path, body, timeoutMs = 8000) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(`${this.apiBaseUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || `Cloud request failed (${response.status})`);
            }

            return data;
        } finally {
            clearTimeout(timeout);
        }
    }

    async startConversation(topic = 'general') {
        this.currentTopic = topic;
        this.conversationHistory = [];
        this.sessionId = `session-${Date.now()}`;

        if (!this.apiBaseUrl) {
            return { text: this.getLocalGreeting(topic), emotion: 'warm' };
        }

        console.log(`Starting conversation to: ${this.apiBaseUrl}/api/chat`);

        try {
            const data = await this.post('/api/chat', {
                userId: this.userProfile?.uid || 'anonymous',
                message: '',
                topic,
                isGreeting: true,
                conversationHistory: [],
            });

            if (data?.success) {
                this.conversationHistory.push({
                    user: '[greeting]',
                    assistant: data.response,
                });
                return {
                    text: data.response,
                    emotion: data.emotion || 'warm',
                };
            }
        } catch (error) {
            console.error('Unable to start cloud conversation:', error.message);
        }

        return { text: this.getLocalGreeting(topic), emotion: 'warm' };
    }

    async sendMessage(userMessage) {
        if (!this.apiBaseUrl) {
            const fallback = this.getFallbackResponse();
            this.conversationHistory.push({ user: userMessage, assistant: fallback });
            return { text: fallback, emotion: 'neutral', shouldEnd: this.shouldEndConversation(userMessage) };
        }

        try {
            const data = await this.post('/api/chat', {
                userId: this.userProfile?.uid || 'anonymous',
                message: userMessage,
                topic: this.currentTopic,
                conversationHistory: this.conversationHistory.slice(-8),
            });

            if (data.success) {
                this.conversationHistory.push({
                    user: userMessage,
                    assistant: data.response,
                });

                this.saveConversationAsync(userMessage, data.response, data.emotion);

                return {
                    text: data.response,
                    emotion: data.emotion || 'neutral',
                    isEmergency: data.isEmergency || false,
                    shouldEnd: this.shouldEndConversation(userMessage),
                };
            }

            const fallback = this.getFallbackResponse();
            this.conversationHistory.push({ user: userMessage, assistant: fallback });
            return { text: fallback, emotion: 'neutral', shouldEnd: false };
        } catch (error) {
            console.error('Send message error:', error);
            const fallback = this.getFallbackResponse();
            this.conversationHistory.push({ user: userMessage, assistant: fallback });
            return { text: fallback, emotion: 'neutral', shouldEnd: false };
        }
    }

    async saveConversationAsync(userMessage, assistantMessage, emotion) {
        if (!this.apiBaseUrl) return;

        try {
            await this.post('/api/conversation/save', {
                userId: this.userProfile?.uid || 'anonymous',
                sessionId: this.sessionId,
                topic: this.currentTopic,
                userMessage,
                assistantMessage,
                emotion: emotion || 'neutral',
                timestamp: Date.now(),
            }, 5000);
        } catch (error) {
            console.log('Failed to save conversation (non-blocking):', error.message);
        }
    }

    shouldEndConversation(text) {
        const endPatterns = [
            /बाय|bye|अलविदा|गुड बाय|good bye/i,
            /बस इतना|bas itna|enough/i,
            /धन्यवाद.*बहुत|thankyou.*very/i,
            /कॉल.*बंद|call.*end|रख.*दो/i,
        ];
        return endPatterns.some(pattern => pattern.test(text));
    }

    getFallbackResponse() {
        const fallbacks = {
            menstrual_health: 'बहन, महावारी एक सामान्य प्रक्रिया है। सफाई रखें और पैड इस्तेमाल करें। ज्यादा तकलीफ हो तो डॉक्टर से जरूर मिलें। बताइए, और क्या जानना चाहती हैं?',
            pregnancy_care: 'गर्भावस्था में पौष्टिक खाना और नियमित जांच बहुत जरूरी है। दीदी, बताइए क्या जानना चाहती हैं?',
            digital_literacy: 'फोन चलाना बहुत आसान है! धीरे-धीरे सीखेंगे। बताइए, क्या करना चाहती हैं?',
            financial_literacy: 'पैसों की समझ बहुत जरूरी है। याद रखें — OTP किसी को मत बताना! बताइए, क्या और जानना चाहती हैं?',
            general_health: 'सेहत सबसे जरूरी है। साफ पानी पीएं, हाथ धोएं। बताइए, कोई तकलीफ है?',
            general: 'मैं सखी हूं, आपकी सहेली! बताइए, आज क्या सीखना चाहती हैं?',
        };
        return fallbacks[this.currentTopic] || fallbacks.general;
    }

    getLocalGreeting(topic) {
        const greetings = {
            menstrual_health: 'नमस्ते बहन! मैं सखी हूं। आज हम महावारी स्वास्थ्य के बारे में बात करेंगे। बताइए, क्या जानना चाहती हैं?',
            pregnancy_care: 'नमस्ते दीदी! मैं सखी हूं। गर्भावस्था के बारे में कोई भी सवाल पूछें! बताइए, क्या जानना चाहती हैं?',
            digital_literacy: 'नमस्ते! मैं सखी हूं, आपकी डिजिटल सहेली! फोन चलाना बहुत आसान है। बताइए, क्या सीखना चाहती हैं?',
            financial_literacy: 'नमस्ते बहन! मैं सखी हूं। पैसों की समझ बहुत जरूरी है। बताइए, किस बारे में जानना है?',
            general_health: 'नमस्ते! मैं सखी हूं, आपकी स्वास्थ्य सहेली! सेहत से जुड़ा कोई भी सवाल पूछें!',
            legal_rights: 'नमस्ते बहन! हर महिला को अपने अधिकार पता होने चाहिए। बताइए, क्या जानना चाहती हैं?',
            general: 'नमस्ते! मैं सखी हूं, आपकी सहेली! आज क्या सीखना चाहती हैं?',
        };
        return greetings[topic] || greetings.general;
    }

    getConversationSummary() {
        return {
            sessionId: this.sessionId,
            topic: this.currentTopic,
            turnCount: this.conversationHistory.length,
            history: this.conversationHistory,
        };
    }

    clearConversation() {
        this.conversationHistory = [];
        this.sessionId = null;
    }
}

export default AwsVoiceAssistant;

export const VOICE_TOPICS = {
    MENSTRUAL_HEALTH: 'menstrual_health',
    PREGNANCY_CARE: 'pregnancy_care',
    DIGITAL_LITERACY: 'digital_literacy',
    FINANCIAL_LITERACY: 'financial_literacy',
    GENERAL_HEALTH: 'general_health',
    LEGAL_RIGHTS: 'legal_rights',
};

const sharedAssistant = new AwsVoiceAssistant();
export async function sendToLLM(message, context = 'general_health') {
    try {
        sharedAssistant.setTopic(context);
        const response = await sharedAssistant.sendMessage(message);
        return response.text || 'मैं यहां आपकी मदद के लिए हूं बहन। कुछ और पूछना चाहती हैं?';
    } catch (error) {
        console.error('sendToLLM error:', error);
        return 'मैं यहां आपकी मदद के लिए हूं बहन। कुछ और पूछना चाहती हैं?';
    }
}
