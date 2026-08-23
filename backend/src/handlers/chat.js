/**
 * POST /api/chat
 * Body: { userId, message, topic, conversationHistory, sessionId? }
 * Returns: { success, response, emotion, isEmergency, usage }
 */

const { invokeBedrockNova } = require('../utils/bedrockClient');
const { SAKHI_SYSTEM_PROMPT, TOPIC_CONTEXTS, GREETING_MESSAGES } = require('../utils/systemPrompt');
const { applyGuardrails } = require('../utils/guardrails');

module.exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        let body = {};
        if (typeof event.body === 'string') {
            try { body = JSON.parse(event.body); }
            catch (error) { console.error('Failed to parse event.body:', event.body); }
        } else if (typeof event.body === 'object' && event.body !== null) {
            body = event.body;
        }

        const {
            userId,
            message,
            topic = 'general',
            conversationHistory = [],
            isGreeting = false,
        } = body;

        if (!message && !isGreeting) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Message is required' }),
            };
        }

        if (isGreeting) {
            const greeting = GREETING_MESSAGES[topic] || GREETING_MESSAGES.general;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    response: greeting,
                    emotion: 'warm',
                    isEmergency: false,
                }),
            };
        }

        const topicContext = TOPIC_CONTEXTS[topic] || TOPIC_CONTEXTS.general;
        const fullSystemPrompt = `${SAKHI_SYSTEM_PROMPT}\n\n${topicContext}`;

        // Keep conversations concise and private to Sakhi's own backend by using
        // only the latest turns required for context.
        const recentHistory = conversationHistory.slice(-10);
        const messages = [];
        for (const turn of recentHistory) {
            if (turn.user) messages.push({ role: 'user', content: turn.user });
            if (turn.assistant) messages.push({ role: 'assistant', content: turn.assistant });
        }
        messages.push({ role: 'user', content: message });

        const result = await invokeBedrockNova(fullSystemPrompt, messages, {
            maxTokens: 250,
            temperature: 0.7,
        });

        if (!result.success) {
            console.error('Bedrock error:', result.error);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    response: getFallbackResponse(topic),
                    emotion: 'neutral',
                    isEmergency: false,
                    isFallback: true,
                }),
            };
        }

        const guardrailResult = applyGuardrails(message, result.response);
        const emotion = detectEmotion(guardrailResult.response);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response: guardrailResult.response,
                emotion,
                isEmergency: guardrailResult.isEmergency,
                usage: {
                    bedrockInputTokens: result.usage?.inputTokens || 0,
                    bedrockOutputTokens: result.usage?.outputTokens || 0,
                },
            }),
        };
    } catch (error) {
        console.error('Chat handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                response: 'माफ कीजिए, कुछ तकनीकी समस्या हो गई। कृपया दोबारा कोशिश करें।',
            }),
        };
    }
};

function detectEmotion(text) {
    if (/शाबाश|बहुत अच्छा|अच्छा कर रही|great|👏|🎉/.test(text)) return 'happy';
    if (/चिंता|सावधान|खतर|ध्यान रखें|careful/.test(text)) return 'concerned';
    if (/समझ|बताती हूं|सीखेंगे|explain/.test(text)) return 'teaching';
    if (/🚨|तुरंत|emergency|हेल्पलाइन/.test(text)) return 'urgent';
    return 'neutral';
}

function getFallbackResponse(topic) {
    const fallbacks = {
        menstrual_health: 'बहन, महावारी बिल्कुल सामान्य है। सफाई रखें और पैड इस्तेमाल करें। ज्यादा दर्द हो तो डॉक्टर से मिलें। बताइए, और क्या जानना है?',
        pregnancy_care: 'दीदी, गर्भावस्था में पौष्टिक खाना बहुत जरूरी है। हरी सब्जियां, दूध, और फल खाएं। नियमित जांच कराएं। बताइए, क्या और जानना चाहती हैं?',
        digital_literacy: 'बहन, फोन चलाना आसान है! धीरे-धीरे सीखेंगे। पहले बताइए, आप फोन में क्या करना चाहती हैं?',
        financial_literacy: 'दीदी, UPI से पैसे भेजना बहुत आसान है। लेकिन याद रखें — OTP किसी को मत बताना! बताइए, क्या और जानना है?',
        general_health: 'बहन, सेहत सबसे बड़ी दौलत है। साफ पानी पीएं, हाथ धोएं, और पौष्टिक खाना खाएं। बताइए, कोई तकलीफ है?',
        general: 'नमस्ते! मैं सखी हूं। मैं आपको स्वास्थ्य, पैसों, फोन, और अधिकारों के बारे में सिखा सकती हूं। क्या जानना चाहती हैं?',
    };
    return fallbacks[topic] || fallbacks.general;
}
