const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

const pollyClient = new PollyClient({ region: process.env.AWS_REGION || 'ap-south-1' });

/**
 * POST /api/speak
 * Body: { text, language, voiceId }
 * Returns: { success, audioBase64, contentType }
 * 
 * Uses Amazon Polly with the "Kajal" neural voice for Hindi.
 * Kajal is a female Indian Hindi voice — perfect for the Sakhi persona.
 */
module.exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const body = JSON.parse(event.body || '{}');
        const {
            text,
            language = 'hi-IN',
            voiceId = 'Kajal',    // Kajal = Hindi neural female voice
            engine = 'neural',    // Neural engine for natural-sounding speech
            speed = 'medium',     // Speech rate
        } = body;

        if (!text) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Text is required' }),
            };
        }

        // Build SSML for better voice control
        const ssml = buildSSML(text, speed);

        // Select voice based on language
        const selectedVoice = selectVoice(language, voiceId);

        const command = new SynthesizeSpeechCommand({
            Text: ssml,
            TextType: 'ssml',
            OutputFormat: 'mp3',
            VoiceId: selectedVoice.voiceId,
            Engine: selectedVoice.engine,
            LanguageCode: selectedVoice.languageCode,
            SampleRate: '22050',
        });

        const response = await pollyClient.send(command);

        // Convert audio stream to base64
        const audioStream = response.AudioStream;
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        const audioBase64 = audioBuffer.toString('base64');

        console.log(`Generated speech: ${text.substring(0, 50)}... (${audioBuffer.length} bytes)`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                audioBase64,
                contentType: 'audio/mpeg',
                voiceId: selectedVoice.voiceId,
                engine: selectedVoice.engine,
                durationEstimate: estimateDuration(text),
            }),
        };
    } catch (error) {
        console.error('Speak handler error:', error);

        // Handle specific Polly errors
        if (error.name === 'TextLengthExceededException') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Text is too long for speech synthesis' }),
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Speech synthesis failed' }),
        };
    }
};

/**
 * Build SSML for better voice control
 */
function buildSSML(text, speed = 'medium') {
    const rateMap = {
        slow: '85%',
        medium: '95%',
        fast: '110%',
    };
    const rate = rateMap[speed] || '95%';

    // Add natural pauses after sentences
    const processedText = text
        .replace(/। /g, '। <break time="300ms"/> ')
        .replace(/\? /g, '? <break time="400ms"/> ')
        .replace(/! /g, '! <break time="200ms"/> ')
        .replace(/— /g, ' <break time="200ms"/> ')
        .replace(/\.\.\./g, '<break time="500ms"/>');

    return `<speak>
    <prosody rate="${rate}">
      ${processedText}
    </prosody>
  </speak>`;
}

/**
 * Select appropriate voice based on language
 * Kajal (Hindi, neural) is the primary voice for Sakhi
 */
function selectVoice(language, preferredVoiceId) {
    const voiceMap = {
        'hi-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'en-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'en-IN' },
        // Fallback to Kajal for all Indian languages (she supports Hindi well)
        'bn-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'ta-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'te-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'mr-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'gu-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'kn-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'ml-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
        'pa-IN': { voiceId: 'Kajal', engine: 'neural', languageCode: 'hi-IN' },
    };

    return voiceMap[language] || voiceMap['hi-IN'];
}

/**
 * Estimate speech duration in seconds (rough estimate)
 * Hindi speech is about 2-3 words per second
 */
function estimateDuration(text) {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / 2.5);
}
