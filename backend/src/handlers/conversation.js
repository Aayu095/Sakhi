const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = `sakhi-conversations-${process.env.STAGE || 'dev'}`;

/**
 * POST /api/conversation/save
 * Body: { userId, sessionId, topic, userMessage, assistantMessage, emotion, timestamp }
 */
module.exports.saveHandler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const body = JSON.parse(event.body || '{}');
        const { userId, sessionId, topic, userMessage, assistantMessage, emotion, timestamp } = body;

        if (!userId || !sessionId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId and sessionId are required' }),
            };
        }

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                userId,
                sessionId,
                topic: topic || 'general',
                userMessage: userMessage || '',
                assistantMessage: assistantMessage || '',
                emotion: emotion || 'neutral',
                timestamp: timestamp || Date.now(),
                ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90-day TTL
            },
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Save conversation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Failed to save conversation' }),
        };
    }
};

/**
 * GET /api/conversation/{userId}
 * Query: ?limit=20
 * Returns recent conversation sessions for a user
 */
module.exports.getHandler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const userId = event.pathParameters?.userId;
        const queryLimit = parseInt(event.queryStringParameters?.limit || '20');

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId is required' }),
            };
        }

        const result = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: { ':uid': userId },
            ScanIndexForward: false, // Newest first
            Limit: queryLimit,
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                conversations: result.Items || [],
                count: result.Count || 0,
            }),
        };
    } catch (error) {
        console.error('Get conversations error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Failed to fetch conversations' }),
        };
    }
};
