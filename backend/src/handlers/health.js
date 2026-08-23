/**
 * GET /api/health
 * Returns system health including Paritok connectivity status.
 * Used by judges to verify the Paritok integration is live.
 */
const { testParitokConnection, PARITOK_API_KEY, PARITOK_BASE_URL, PARITOK_ENABLED } = require('../utils/paritokClient');

module.exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    // Test Paritok connectivity in parallel with returning base health
    const paritokTest = PARITOK_ENABLED
        ? await testParitokConnection()
        : { ok: false, reason: 'disabled_in_config' };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            status:    'healthy',
            service:   'sakhi-backend',
            timestamp: new Date().toISOString(),
            region:    process.env.AWS_REGION || 'us-east-1',
            stage:     process.env.STAGE      || 'dev',

            // ── Paritok Integration Status ─────────────────────────
            paritok: {
                enabled:          PARITOK_ENABLED,
                apiUrl:           PARITOK_BASE_URL,
                apiKeyConfigured: PARITOK_API_KEY !== 'YOUR_PARITOK_API_KEY_HERE' && PARITOK_API_KEY.startsWith('pk_live_'),
                connected:        paritokTest.ok,
                connectionStatus: paritokTest.status || (paritokTest.ok ? 200 : 'error'),
                message:          paritokTest.ok
                    ? '✅ Paritok API reachable — token compression active'
                    : `⚠️  Paritok API unreachable (${paritokTest.error || paritokTest.status}) — fallback mode`,
            },

            // ── AWS Services ───────────────────────────────────────
            aws: {
                bedrock: 'amazon.nova-lite-v1:0',
                polly:   'neural-tts',
                region:  process.env.AWS_REGION || 'us-east-1',
            },

            // ── About Sakhi ────────────────────────────────────────
            about: {
                name:        'Sakhi AI',
                description: 'Voice-first AI companion for 300M+ rural Indian women',
                features:    ['voice-only-interface', 'hindi-hinglish', 'paritok-compression', 'aws-bedrock', 'amazon-polly'],
            },
        }),
    };
};
