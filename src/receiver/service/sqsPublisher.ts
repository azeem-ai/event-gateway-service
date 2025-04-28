import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '@/shared';
import logger from '@/shared/utils/logger';
import { MESSAGES } from '@/shared/constants/messages';

/**
 * Processes incoming HTTP events and publishes to AWS SQS.
 * @param {APIGatewayProxyEvent} event The incoming HTTP request event.
 * @return {Promise<APIGatewayProxyResult>} The HTTP response for API Gateway.
 * @throws Throws if validation or SQS publishing fails.
 */
const sqsClient = new SQSClient({});

// Sends a message to the SQS queue
export const publishToQueue = async (message: object): Promise<void> => {
    const command = new SendMessageCommand({
        QueueUrl: config.sqsQueueUrl,
        MessageBody: JSON.stringify(message),
    });

    try {
        await sqsClient.send(command);
        logger.info(MESSAGES.RECEIVER.SEND_TO_SQS_SUCCESS, { message });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(MESSAGES.RECEIVER.SEND_TO_SQS_FAIL, { error: err.message });
        } else {
            logger.error(MESSAGES.RECEIVER.SEND_TO_SQS_FAIL, { error: JSON.stringify(err) });
        }
        throw err;
    }
};
