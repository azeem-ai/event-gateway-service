import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '@/shared';
import logger from '@/shared/utils/logger';
import { MESSAGES } from '@/shared/constants/messages';

// Create and reuse one SQS client
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
