process.env.SQS_QUEUE_URL = 'https://mock-sqs-url';
process.env.GRAPHQL_ENDPOINT = 'https://mock-graphql-endpoint';
process.env.AUTH_TOKEN = 'mock-token';
process.env.BRAND_NAME = 'brandName';

import { SQSEvent, SQSRecord } from 'aws-lambda';
import { handler } from '@/dispatcher/handler';
import * as graphqlPoster from '@/dispatcher/service/graphqlPoster';
import { logger } from '@/shared';

jest.mock('../service/graphqlPoster');
const mockPost = graphqlPoster.postToGraphQL as jest.Mock;

// Utility to build a mock SQS event
const buildSQSEvent = (messageBody: object): SQSEvent => {
    const record: Partial<SQSRecord> = {
        body: JSON.stringify(messageBody),
        messageId: 'test-message-id',
    };

    return {
        Records: [record as SQSRecord],
    };
};

describe('dispatcher.handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // mock logger.error
        jest.spyOn(logger, 'error').mockImplementation();
    });

    it('should successfully post a valid event to GraphQL', async () => {
        mockPost.mockResolvedValueOnce(undefined);

        const event = buildSQSEvent({
            id: '1',
            name: 'Test Event',
            body: 'Test Body',
            timestamp: new Date().toISOString(),
            brand: process.env.BRAND_NAME,
        });

        await handler(event);

        expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('should skip invalid payload and not call GraphQL', async () => {
        const invalidEvent = buildSQSEvent({
            id: '1',
            // name is missing
            body: 'Test Body',
            timestamp: 'invalid-date',
            brand: process.env.BRAND_NAME,
        });

        await handler(invalidEvent);

        expect(mockPost).not.toHaveBeenCalled();
    });

    it('should log an error if postToGraphQL fails', async () => {
        mockPost.mockRejectedValueOnce(new Error('GraphQL Error'));

        const event = buildSQSEvent({
            id: '2',
            name: 'Failing Event',
            body: 'Test',
            timestamp: new Date().toISOString(),
            brand: process.env.BRAND_NAME,
        });

        try {
            await handler(event);
        } catch {
            // intentionally ignore the error to continue test
        }

        // Expect logger.error to have been called
        expect(logger.error).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                messageId: 'test-message-id',
                error: 'GraphQL Error',
            })
        );
    });
});
