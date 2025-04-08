import { APIGatewayProxyHandler } from 'aws-lambda';
import { IncomingEventSchema, logger } from '@/shared';
import { publishToQueue } from './service/sqsPublisher';

// Event receiver lambda function handler
export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const parsedBody = JSON.parse(event.body || '{}');
        const result = IncomingEventSchema.safeParse(parsedBody);

        if (!result.success) {
            logger.warn('Invalid payload', { errors: result.error.flatten() });
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const validEvent = result.data;

        // Publish the validated event to the SQS queue
        await publishToQueue(validEvent);

        return { statusCode: 202, body: JSON.stringify({ message: 'Event received' }) };
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error('Unexpected error', { error: err.message });
        } else {
            logger.error('Unexpected non-error thrown', { error: JSON.stringify(err) });
        }

        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
