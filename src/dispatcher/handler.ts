import { SQSEvent } from 'aws-lambda';
import { IncomingEventSchema, logger } from '@/shared';
import { postToGraphQL } from './service/graphqlPoster';
import { MESSAGES } from '@/shared/constants/messages';

export const handler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        try {
            // Step 1: Parse the SQS message body
            const messageBody = JSON.parse(record.body);

            // Step 2: Validate message shape using Zod
            const result = IncomingEventSchema.safeParse(messageBody);
            if (!result.success) {
                logger.warn(MESSAGES.DISPATCHER.INVALID_EVENT, {
                    recordId: record.messageId,
                    errors: result.error.flatten(),
                });
                continue; // skip this record
            }

            const validEvent = result.data;

            // Step 3: Send the validated event to the GraphQL API
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

            throw err; // Allow Lambda retries / DLQ handling
        }
    }
};
