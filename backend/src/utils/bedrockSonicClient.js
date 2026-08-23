/**
 * Amazon Nova 2 Sonic - Bedrock Bidirectional Streaming Client
 * 
 * This client handles speech-to-speech communication with Amazon Nova 2 Sonic
 * using the InvokeModelWithBidirectionalStream API.
 * 
 * Protocol:
 * 1. Open bidirectional stream
 * 2. Send session configuration (model, system prompt, audio settings)
 * 3. Send audio input chunks
 * 4. Signal end of audio
 * 5. Collect audio output chunks
 * 6. Return complete audio response
 */

const {
    BedrockRuntimeClient,
    InvokeModelWithBidirectionalStreamCommand,
} = require('@aws-sdk/client-bedrock-runtime');

const REGION = 'us-east-1';
const MODEL_ID = 'amazon.nova-sonic-v1:0';

// Nova Sonic uses 16kHz, 16-bit PCM audio
const AUDIO_SAMPLE_RATE = 16000;
const AUDIO_CHUNK_SIZE_MS = 100; // 100ms chunks
const CHUNK_BYTES = (AUDIO_SAMPLE_RATE * 2 * AUDIO_CHUNK_SIZE_MS) / 1000; // 3200 bytes per chunk

const client = new BedrockRuntimeClient({ region: REGION });

/**
 * Invoke Nova Sonic with audio input and get audio + text response.
 * 
 * @param {string} systemPrompt - The Sakhi persona system prompt 
 * @param {Buffer} audioBuffer - Raw PCM 16-bit 16kHz mono audio
 * @param {Object} options - Additional options
 * @returns {Object} { success, audioBase64, textResponse, error }
 */
async function invokeNovaSonic(systemPrompt, audioBuffer, options = {}) {
    const sessionId = `sakhi-${Date.now()}`;
    const contentBlockId = 'audio-content-1';
    const promptName = 'sakhi-system';

    try {
        // Build the async input event stream
        const inputEvents = buildInputEventStream(
            sessionId,
            contentBlockId,
            promptName,
            systemPrompt,
            audioBuffer
        );

        const command = new InvokeModelWithBidirectionalStreamCommand({
            modelId: MODEL_ID,
            body: inputEvents,
        });

        const response = await client.send(command);

        // Process the output stream
        const result = await processOutputStream(response.body);

        return {
            success: true,
            audioBase64: result.audioBase64,
            textResponse: result.textResponse,
            contentType: 'audio/pcm',  // 16-bit PCM 16kHz mono
            sampleRate: AUDIO_SAMPLE_RATE,
        };
    } catch (error) {
        console.error('Nova Sonic error:', error);
        return {
            success: false,
            error: error.message || 'Nova Sonic invocation failed',
        };
    }
}

/**
 * Build the async iterable event stream for Nova Sonic input.
 * Events must be sent in order:
 * 1. sessionConfiguration
 * 2. promptStart
 * 3. systemPrompt (text content)
 * 4. promptEnd (for system prompt)
 * 5. promptStart (for user turn)
 * 6. audioInput events (chunked PCM audio)
 * 7. contentEnd
 * 8. promptEnd (for user turn)
 * 9. sessionEnd
 */
async function* buildInputEventStream(sessionId, contentBlockId, promptName, systemPrompt, audioBuffer) {
    // 1. Session configuration
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'sessionConfiguration',
                data: {
                    sessionId: sessionId,
                    inferenceConfiguration: {
                        maxTokens: 1024,
                        topP: 0.9,
                        temperature: 0.7,
                    },
                    audioInputConfiguration: {
                        mediaType: 'audio/lpcm',
                        sampleRateHertz: AUDIO_SAMPLE_RATE,
                        sampleSizeBits: 16,
                        channelCount: 1,
                        audioEndpointConfiguration: {
                            voiceActivityDetection: {
                                enabled: false, // We control when audio ends
                            },
                        },
                    },
                    audioOutputConfiguration: {
                        mediaType: 'audio/lpcm',
                        sampleRateHertz: AUDIO_SAMPLE_RATE,
                        sampleSizeBits: 16,
                        channelCount: 1,
                        voiceId: 'tiffany', // Female voice
                    },
                    textOutputConfiguration: {
                        enabled: true, // Also get text transcript
                    },
                },
            })),
        },
    };

    // Small delay to let config process
    await sleep(50);

    // 2. System prompt start
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'promptStart',
                data: {
                    promptName: promptName,
                    textOutputConfiguration: { enabled: true },
                    audioOutputConfiguration: { enabled: true },
                },
            })),
        },
    };

    // 3. System prompt content
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'textInput',
                data: {
                    promptName: promptName,
                    contentBlockIndex: 0,
                    role: 'system',
                    text: systemPrompt,
                },
            })),
        },
    };

    // 4. System prompt end
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'promptEnd',
                data: {
                    promptName: promptName,
                },
            })),
        },
    };

    await sleep(50);

    // 5. User turn prompt start
    const userPromptName = 'user-audio-turn';
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'promptStart',
                data: {
                    promptName: userPromptName,
                    textOutputConfiguration: { enabled: true },
                    audioOutputConfiguration: { enabled: true },
                },
            })),
        },
    };

    // 6. Send audio chunks
    let offset = 0;
    let blockIndex = 0;
    while (offset < audioBuffer.length) {
        const end = Math.min(offset + CHUNK_BYTES, audioBuffer.length);
        const chunk = audioBuffer.slice(offset, end);

        yield {
            chunk: {
                bytes: Buffer.from(JSON.stringify({
                    event: 'audioInput',
                    data: {
                        promptName: userPromptName,
                        contentBlockIndex: blockIndex,
                        audio: chunk.toString('base64'),
                    },
                })),
            },
        };

        offset = end;
        blockIndex++;
        // Small delay between chunks to avoid overwhelming
        await sleep(10);
    }

    // 7. Content end
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'contentEnd',
                data: {
                    promptName: userPromptName,
                    contentBlockIndex: blockIndex,
                },
            })),
        },
    };

    // 8. User turn prompt end
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'promptEnd',
                data: {
                    promptName: userPromptName,
                },
            })),
        },
    };

    // 9. Session end
    yield {
        chunk: {
            bytes: Buffer.from(JSON.stringify({
                event: 'sessionEnd',
                data: {},
            })),
        },
    };
}

/**
 * Process the output stream from Nova Sonic.
 * Collects audio chunks and text responses.
 */
async function processOutputStream(outputStream) {
    const audioChunks = [];
    let textResponse = '';

    try {
        for await (const event of outputStream) {
            if (event.chunk && event.chunk.bytes) {
                const parsed = JSON.parse(Buffer.from(event.chunk.bytes).toString('utf-8'));

                if (parsed.event === 'audioOutput') {
                    // Collect audio chunks
                    const audioData = Buffer.from(parsed.data.audio, 'base64');
                    audioChunks.push(audioData);
                } else if (parsed.event === 'textOutput') {
                    // Collect text transcript
                    if (parsed.data && parsed.data.text) {
                        textResponse += parsed.data.text;
                    }
                } else if (parsed.event === 'error') {
                    console.error('Nova Sonic stream error:', parsed.data);
                    throw new Error(parsed.data.message || 'Stream error');
                }
            }
        }
    } catch (error) {
        console.error('Error processing output stream:', error);
        if (audioChunks.length === 0 && !textResponse) {
            throw error;
        }
    }

    // Combine all audio chunks
    const combinedAudio = Buffer.concat(audioChunks);

    return {
        audioBase64: combinedAudio.toString('base64'),
        textResponse: textResponse,
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    invokeNovaSonic,
    MODEL_ID,
    AUDIO_SAMPLE_RATE,
};
