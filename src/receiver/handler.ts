import { APIGatewayProxyHandler } from 'aws-lambda';
import { IncomingEventSchema, EnrichedEventSchema, EnrichedEvent, logger } from '@/shared';
import { publishToQueue } from './service/sqsPublisher';
import { MESSAGES } from '@/shared/constants/messages';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';

/**
 * Receives HTTP events from the source application, validates and enriches the event, and publishes to SQS.
 * @param {APIGatewayProxyEvent} event The incoming HTTP request event from API Gateway.
 * @return {Promise<APIGatewayProxyResult>} The HTTP response to return to API Gateway.
 * @throws Throws if validation fails or SQS publishing encounters an error.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const parsedBody = JSON.parse(event.body ?? '{}');
        const result = IncomingEventSchema.safeParse(parsedBody);

        if (!result.success) {
            logger.warn(MESSAGES.RECEIVER.INVALID_PAYLOAD, { errors: result.error.flatten() });
            return { statusCode: HTTP_STATUS.BAD_REQUEST, body: JSON.stringify({ error: MESSAGES.RECEIVER.INVALID_PAYLOAD }) };
        }

        const validEvent = result.data;
        const brandName = process.env.BRAND_NAME ?? '';

        // Enrich event with brand name
        const enrichedEvent: EnrichedEvent = {
            ...validEvent,
            brand: brandName,
        };

        // Validate event after enrichment
        const enrichedResult = EnrichedEventSchema.safeParse(enrichedEvent);

        if (!enrichedResult.success) {
            logger.error(MESSAGES.RECEIVER.ENRICHED_EVENT_INVALID, { errors: enrichedResult.error.flatten() });
            return {
                statusCode: HTTP_STATUS.INTERNAL_ERROR,
                body: JSON.stringify({ error: MESSAGES.RECEIVER.ENRICHED_EVENT_INVALID }),
            };
        }

        // Publish the validated and enriched event to the SQS queue
        await publishToQueue(enrichedEvent);

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
