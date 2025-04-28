import { SQSEvent } from 'aws-lambda';
import { EnrichedEventSchema, logger } from '@/shared';
import { postToGraphQL } from './service/graphqlPoster';
import { MESSAGES } from '@/shared/constants/messages';

/**
 * Processes SQS messages by validating and forwarding enriched events to the GraphQL API.
 * @param {SQSEvent} event Batch of SQS messages received by the Lambda trigger.
 * @return {Promise<void>} Resolves after all valid messages are processed.
 * @throws Throws if posting to the GraphQL API fails for any message.
 */
export const handler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        try {
            // Parse the SQS message body
            const messageBody = JSON.parse(record.body);

            // Validate enriched message
            const result = EnrichedEventSchema.safeParse(messageBody);
            if (!result.success) {
                logger.warn(MESSAGES.DISPATCHER.INVALID_EVENT, {
                    recordId: record.messageId,
                    errors: result.error.flatten(),
                });

                // skip this record
                continue;
            }

            const validEvent = result.data;

            // Send the validated event to the GraphQL API
            await postToGraphQL(validEvent);

            logger.info(MESSAGES.DISPATCHER.GRAPHQL_SUCCESS, { eventId: validEvent.id });
        } catch (err: unknown) {
            if (err instanceof Error) {
                logger.error(MESSAGES.DISPATCHER.GRAPHQL_FAIL, {
                    messageId: record.messageId,
                    error: err.message,
                });
            } else {
                logger.error(MESSAGES.DISPATCHER.GRAPHQL_FAIL, {
                    messageId: record.messageId,
                    error: JSON.stringify(err),
                });
            }

            // Allow Lambda retries / DLQ handling
            throw err;
        }
    }
};
