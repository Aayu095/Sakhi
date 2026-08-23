const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

const AUDIO_BUCKET = process.env.AUDIO_BUCKET;

/**
 * POST /api/transcribe
 * Body: { audioBase64, language, userId }
 * 
 * Flow:
 * 1. Receive base64 audio from client
 * 2. Upload to S3 (temp bucket with 1-day expiry)
 * 3. Start Transcribe job
 * 4. Poll for completion
 * 5. Return transcribed text
 */
module.exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const body = JSON.parse(event.body || '{}');
        const {
            audioBase64,
            language = 'hi-IN',
            userId = 'anonymous',
        } = body;

        if (!audioBase64) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'audioBase64 is required' }),
            };
        }

        // Decode base64 audio
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const jobId = `sakhi-${userId}-${uuidv4()}`;
        const s3Key = `transcribe-input/${jobId}.m4a`;

        // Upload audio to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: AUDIO_BUCKET,
            Key: s3Key,
            Body: audioBuffer,
            ContentType: 'audio/mp4',
        }));

        console.log(`Uploaded audio to s3://${AUDIO_BUCKET}/${s3Key}`);

        // Map language codes to Transcribe language codes
        const transcribeLanguage = mapLanguageCode(language);

        // Start transcription job
        await transcribeClient.send(new StartTranscriptionJobCommand({
            TranscriptionJobName: jobId,
            LanguageCode: transcribeLanguage,
            // Expo HIGH_QUALITY preset records m4a (mp4 container with AAC audio)
            MediaFormat: 'mp4',
            Media: {
                MediaFileUri: `s3://${AUDIO_BUCKET}/${s3Key}`,
            },
            Settings: {
                ShowSpeakerLabels: false,
                ChannelIdentification: false,
            },
        }));

        console.log(`Started transcription job: ${jobId}`);

        // Poll for completion (max 30 seconds)
        const transcript = await pollTranscriptionJob(jobId, 30000);

        if (transcript.success) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    text: transcript.text,
                    confidence: transcript.confidence,
                    language: transcribeLanguage,
                    provider: 'amazon-transcribe',
                }),
            };
        } else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: transcript.error,
                    text: '',
                    provider: 'amazon-transcribe',
                }),
            };
        }
    } catch (error) {
        console.error('Transcribe handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Transcription failed',
                text: '',
            }),
        };
    }
};

/**
 * Poll transcription job until completion
 */
async function pollTranscriptionJob(jobName, timeout) {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < timeout) {
        const response = await transcribeClient.send(new GetTranscriptionJobCommand({
            TranscriptionJobName: jobName,
        }));

        const status = response.TranscriptionJob.TranscriptionJobStatus;

        if (status === 'COMPLETED') {
            // Fetch the transcript from the output URI
            const transcriptUri = response.TranscriptionJob.Transcript.TranscriptFileUri;
            const transcriptText = await fetchTranscript(transcriptUri);
            return {
                success: true,
                text: transcriptText.text,
                confidence: transcriptText.confidence,
            };
        }

        if (status === 'FAILED') {
            return {
                success: false,
                error: response.TranscriptionJob.FailureReason || 'Transcription failed',
            };
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return { success: false, error: 'Transcription timed out' };
}

/**
 * Fetch transcript result from URI
 */
async function fetchTranscript(uri) {
    try {
        // Transcribe outputs to its own managed S3 location
        const response = await fetch(uri);
        const data = await response.json();

        const results = data.results;
        if (results && results.transcripts && results.transcripts.length > 0) {
            const transcript = results.transcripts[0].transcript;
            // Get average confidence from items
            let totalConfidence = 0;
            let itemCount = 0;
            if (results.items) {
                for (const item of results.items) {
                    if (item.alternatives && item.alternatives[0].confidence) {
                        totalConfidence += parseFloat(item.alternatives[0].confidence);
                        itemCount++;
                    }
                }
            }
            return {
                text: transcript,
                confidence: itemCount > 0 ? totalConfidence / itemCount : 0.8,
            };
        }

        return { text: '', confidence: 0 };
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return { text: '', confidence: 0 };
    }
}

/**
 * Map app language codes to Amazon Transcribe language codes
 */
function mapLanguageCode(appLanguage) {
    const mapping = {
        'hi-IN': 'hi-IN',    // Hindi
        'en-IN': 'en-IN',    // English (India)
        'bn-IN': 'bn-IN',    // Bengali
        'ta-IN': 'ta-IN',    // Tamil
        'te-IN': 'te-IN',    // Telugu
        'mr-IN': 'mr-IN',    // Marathi
        'gu-IN': 'gu-IN',    // Gujarati
        'kn-IN': 'kn-IN',    // Kannada
        'ml-IN': 'ml-IN',    // Malayalam
        'pa-IN': 'pa-guru-IN', // Punjabi (Gurmukhi)
    };
    return mapping[appLanguage] || 'hi-IN';
}
