process.env.SQS_QUEUE_URL = 'https://mock-sqs-url';
process.env.GRAPHQL_ENDPOINT = 'https://mock-graphql-endpoint';
process.env.AUTH_TOKEN = 'mock-token';
process.env.BRAND_NAME = 'brandName';

import { handler } from '@/receiver/handler';
import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult,
} from 'aws-lambda';
import * as publisher from '@/receiver/service/sqsPublisher';
import { MESSAGES } from '@/shared/constants/messages';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';

// Mock the SQS publisher
jest.mock('@/receiver/service/sqsPublisher');
const mockPublish = publisher.publishToQueue as jest.Mock;

// Mock context and callback
const mockContext = {} as Context;
const mockCallback: Callback = () => { };

const buildEvent = (body: object): APIGatewayProxyEvent => {
    const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify(body),
    };

    // Assert as full APIGatewayProxyEvent
    return event as APIGatewayProxyEvent;
};

describe('receiver.handler', () => {
    it('returns 202 for valid event', async () => {
        mockPublish.mockResolvedValueOnce(undefined);

        const inputEvent = {
            id: '1',
            name: 'test event',
            body: 'test body',
            timestamp: new Date().toISOString(),
        };

        const res = await handler(
            buildEvent(inputEvent),
            mockContext,
            mockCallback
        ) as APIGatewayProxyResult;

        expect(res.statusCode).toBe(HTTP_STATUS.ACCEPTED);
        expect(JSON.parse(res.body)).toEqual({ message: MESSAGES.RECEIVER.EVENT_RECEIVED_SUCCESS });

        // Verify the event enrichment
        expect(mockPublish).toHaveBeenCalledWith(expect.objectContaining({
            ...inputEvent,
            brand: process.env.BRAND_NAME,
        }));
    });


    it('returns 400 for invalid payload', async () => {
        const res = await handler(
            buildEvent({ id: 'missing-fields' }),
            mockContext,
            mockCallback
        ) as APIGatewayProxyResult;

        expect(res.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 500 when publishing fails', async () => {
        mockPublish.mockRejectedValueOnce(new Error(MESSAGES.RECEIVER.SQS_FAILED));

        const res = await handler(
            buildEvent({
                id: '2',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString(),
            }),
            mockContext,
            mockCallback
        ) as APIGatewayProxyResult;

        expect(res.statusCode).toBe(HTTP_STATUS.INTERNAL_ERROR);
        expect(JSON.parse(res.body)).toEqual({ error: MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR });
    });
});
