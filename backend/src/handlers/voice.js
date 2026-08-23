const { invokeNovaSonic } = require('../utils/bedrockSonicClient');
const { SAKHI_SYSTEM_PROMPT, TOPIC_CONTEXTS } = require('../utils/systemPrompt');

/**
 * POST /api/voice
 * Body: { audioBase64, topic, userId }
 * 
 * Unified voice endpoint:
 * - Accepts base64-encoded PCM audio (16-bit, 16kHz, mono)
 * - Sends it directly to Amazon Nova Sonic
 * - Returns base64-encoded PCM audio response + text transcript
 * 
 * No Transcribe. No Polly. One single hop.
 */
module.exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        // Parse body (handle both string and pre-parsed object from API Gateway)
        let body = {};
        if (typeof event.body === 'string') {
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                console.error("Failed to parse event.body:", e.message);
            }
        } else if (typeof event.body === 'object' && event.body !== null) {
            body = event.body;
        }

        const {
            audioBase64,
            topic = 'general',
            userId = 'anonymous',
        } = body;

        if (!audioBase64) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'audioBase64 is required. Send PCM 16-bit 16kHz mono audio.',
                }),
            };
        }

        // Decode the incoming audio
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        console.log(`Received audio: ${audioBuffer.length} bytes from user ${userId}`);

        // Build the full system prompt with topic context
        const topicContext = TOPIC_CONTEXTS[topic] || TOPIC_CONTEXTS.general;
        const fullSystemPrompt = `${SAKHI_SYSTEM_PROMPT}\n\n${topicContext}`;

        // Invoke Nova Sonic — single hop, audio in → audio out
        const result = await invokeNovaSonic(fullSystemPrompt, audioBuffer);

        if (!result.success) {
            console.error('Nova Sonic error:', result.error);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: result.error,
                    textResponse: 'माफ कीजिए, आवाज़ समझने में कुछ दिक्कत हुई। कृपया दोबारा बोलें।',
                }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                audioBase64: result.audioBase64,
                textResponse: result.textResponse,
                contentType: result.contentType,
                sampleRate: result.sampleRate,
            }),
        };
    } catch (error) {
        console.error('Voice handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                textResponse: 'माफ कीजिए, कुछ तकनीकी समस्या हो गई। कृपया दोबारा कोशिश करें।',
            }),
        };
    }
};
