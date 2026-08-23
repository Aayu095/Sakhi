const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize Bedrock client — reused across invocations (connection reuse)
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

// Amazon Nova Lite — dramatically smarter than Micro, natively in us-east-1
const MODEL_ID = 'amazon.nova-lite-v1:0';

/**
 * Invoke Amazon Nova on Amazon Bedrock using the Converse API
 * @param {string} systemPrompt - The system prompt (Sakhi persona)
 * @param {Array} messages - Conversation history [{role: 'user'|'assistant', content: '...'}]
 * @param {Object} options - Additional options
 * @returns {Object} - { success, response, usage }
 */
async function invokeBedrockNova(systemPrompt, messages, options = {}) {
    const {
        maxTokens = 300,      // Keep responses short for voice
        temperature = 0.7,    // Warm, natural tone
        topP = 0.9,
    } = options;

    // The Converse API expects a specific format for system and messages
    const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }],
    }));

    try {
        console.log(`Invoking Amazon Nova model: ${MODEL_ID}`);

        const command = new ConverseCommand({
            modelId: MODEL_ID,
            system: [{ text: systemPrompt }],
            messages: formattedMessages,
            inferenceConfig: {
                maxTokens: maxTokens,
                temperature: temperature,
                topP: topP,
            }
        });

        const response = await bedrockClient.send(command);

        console.log(`Success with Amazon Nova.`);
        return {
            success: true,
            response: response.output.message.content[0].text,
            usage: {
                inputTokens: response.usage?.inputTokens || 0,
                outputTokens: response.usage?.outputTokens || 0,
            },
            stopReason: response.stopReason,
            modelUsed: MODEL_ID,
        };
    } catch (error) {
        console.error(`Amazon Nova model failed:`, error.name, error.message);

        // If it's a throttling error, wait and retry logic could be added here
        if (error.name === 'ThrottlingException') {
            return { success: false, error: 'Rate limited. Please try again.', code: 'THROTTLED' };
        }
        if (error.name === 'ModelTimeoutException') {
            return { success: false, error: 'AI took too long to respond.', code: 'TIMEOUT' };
        }
        if (error.name === 'ValidationException' || error.name === 'AccessDeniedException') {
            return { success: false, error: 'Model access or validation error.', code: error.name };
        }

        return { success: false, error: error.message || 'AI unavailable', code: error.name };
    }
}

module.exports = { invokeBedrockNova, MODEL_ID };
