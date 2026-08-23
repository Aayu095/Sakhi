const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = `sakhi-users-${process.env.STAGE || 'dev'}`;

/**
 * POST /api/user/profile
 * Body: { userId, name, language, age, state, welcomeCompleted, ... }
 */
module.exports.saveHandler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const body = JSON.parse(event.body || '{}');
        const { userId, ...profileData } = body;

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId is required' }),
            };
        }

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                userId,
                ...profileData,
                updatedAt: Date.now(),
            },
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Save user profile error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Failed to save profile' }),
        };
    }
};

/**
 * GET /api/user/profile/{userId}
 */
module.exports.getHandler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const userId = event.pathParameters?.userId;

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId is required' }),
            };
        }

        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId },
        }));

        if (!result.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, error: 'Profile not found' }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                profile: result.Item,
            }),
        };
    } catch (error) {
        console.error('Get user profile error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Failed to fetch profile' }),
        };
    }
};
