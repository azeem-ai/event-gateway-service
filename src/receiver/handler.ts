import { APIGatewayProxyHandler } from 'aws-lambda';
import { IncomingEventSchema, logger } from '@/shared';
import { publishToQueue } from './service/sqsPublisher';
import { MESSAGES } from '@/shared/constants/messages';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';

// Event receiver lambda function handler
export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const parsedBody = JSON.parse(event.body ?? '{}');
        const result = IncomingEventSchema.safeParse(parsedBody);

        if (!result.success) {
            logger.warn(MESSAGES.RECEIVER.INVALID_PAYLOAD, { errors: result.error.flatten() });
            return { statusCode: HTTP_STATUS.BAD_REQUEST, body: JSON.stringify({ error: MESSAGES.RECEIVER.INVALID_PAYLOAD }) };
        }

        const validEvent = result.data;

        // Publish the validated event to the SQS queue
        await publishToQueue(validEvent);

        return { statusCode: HTTP_STATUS.ACCEPTED, body: JSON.stringify({ message: MESSAGES.RECEIVER.EVENT_RECEIVED_SUCCESS }) };
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(MESSAGES.SYSTEM.UNEXPECTED_ERROR, { error: err.message });
        } else {
            logger.error(MESSAGES.SYSTEM.NON_ERROR_THROWN, { error: JSON.stringify(err) });
        }

        return { statusCode: HTTP_STATUS.INTERNAL_ERROR, body: JSON.stringify({ error: MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR }) };
    }
};
