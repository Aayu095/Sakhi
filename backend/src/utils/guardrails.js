// Content safety guardrails for Sakhi responses
// Filters harmful content and ensures culturally appropriate responses

const BLOCKED_PATTERNS = [
    // Medical danger
    /abort|गर्भपात.*करने.*का.*तरीका|medicine.*name.*for/i,
    // Financial exploitation
    /bank.*account.*number|credit.*card|debit.*card.*number/i,
    // Self-harm
    /suicide|आत्महत्या|मरना.*चाहती/i,
    // Violence
    /किसी.*को.*मारना|poison|ज़हर/i,
];

const EMERGENCY_KEYWORDS = [
    /मार.*रहा|पीट.*रहा|domestic.*violence|घरेलू.*हिंसा/i,
    /danger|खतरा|help.*me|बचाओ|मदद/i,
    /suicide|आत्महत्या|जीना.*नहीं/i,
];

const EMERGENCY_RESPONSE = `
बहन, आपकी बात सुनकर मुझे चिंता हो रही है। कृपया तुरंत मदद लें:

🚨 महिला हेल्पलाइन: 1091
🚔 पुलिस: 100
🏥 एम्बुलेंस: 108

आप अकेली नहीं हैं। मदद मिलेगी।
`.trim();

/**
 * Check if user input contains emergency signals
 */
function isEmergency(text) {
    return EMERGENCY_KEYWORDS.some(pattern => pattern.test(text));
}

/**
 * Check if user input contains blocked content
 */
function isBlocked(text) {
    return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Sanitize AI response for safety
 */
function sanitizeResponse(response) {
    // Remove any specific drug/medicine names
    let sanitized = response.replace(/\b(paracetamol|ibuprofen|aspirin|combiflam|crocin|meftal)\b/gi,
        'दवाई (doctor से पूछें)');

    // Remove any specific dosage information
    sanitized = sanitized.replace(/\d+\s*(mg|ml|tablet|गोली|dose)/gi, '(doctor से पूछें)');

    return sanitized;
}

/**
 * Apply all guardrails to the conversation
 * @param {string} userMessage - The user's message
 * @param {string} aiResponse - The AI's response
 * @returns {Object} - { safe, response, isEmergency }
 */
function applyGuardrails(userMessage, aiResponse) {
    // Check for emergency in user message
    if (isEmergency(userMessage)) {
        return {
            safe: true,
            response: EMERGENCY_RESPONSE,
            isEmergency: true,
        };
    }

    // Check for blocked content in user message
    if (isBlocked(userMessage)) {
        return {
            safe: false,
            response: 'बहन, यह जानकारी मेरे लिए देना सही नहीं होगा। कृपया इस विषय पर डॉक्टर या विशेषज्ञ से बात करें। क्या मैं किसी और विषय पर आपकी मदद कर सकती हूं?',
            isEmergency: false,
        };
    }

    // Sanitize the AI response
    const sanitized = sanitizeResponse(aiResponse);

    return {
        safe: true,
        response: sanitized,
        isEmergency: false,
    };
}

module.exports = { applyGuardrails, isEmergency, isBlocked, EMERGENCY_RESPONSE };
