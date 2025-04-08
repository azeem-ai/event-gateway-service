process.env.SQS_QUEUE_URL = 'https://mock-sqs-url';
process.env.GRAPHQL_ENDPOINT = 'https://mock-graphql-endpoint';
process.env.AUTH_TOKEN = 'mock-token';

import { handler } from '@/receiver/handler';
import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult,
} from 'aws-lambda';
import * as publisher from '@/receiver/service/sqsPublisher';

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

        const res = await handler(
            buildEvent({
                id: '1',
                name: 'test event',
                body: 'test body',
                timestamp: new Date().toISOString(),
            }),
            mockContext,
            mockCallback
        ) as APIGatewayProxyResult;

        expect(res.statusCode).toBe(202);
        expect(JSON.parse(res.body)).toEqual({ message: 'Event received' });
    });

    it('returns 400 for invalid payload', async () => {
        const res = await handler(
            buildEvent({ id: 'missing-fields' }),
            mockContext,
            mockCallback
        ) as APIGatewayProxyResult;

        expect(res.statusCode).toBe(400);
    });

    it('returns 500 when publishing fails', async () => {
        mockPublish.mockRejectedValueOnce(new Error('SQS failed'));

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

        expect(res.statusCode).toBe(500);
        expect(JSON.parse(res.body)).toEqual({ error: 'Internal server error' });
    });
});
