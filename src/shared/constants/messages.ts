export const MESSAGES = {
    RECEIVER: {
        INVALID_PAYLOAD: 'Invalid payload',
        EVENT_RECEIVED_SUCCESS: 'Event received',
        SEND_TO_SQS_SUCCESS: 'Event successfully published to SQS',
        SEND_TO_SQS_FAIL: 'Failed to publish event to SQS',
        SQS_FAILED: 'SQS failed'
    },
    DISPATCHER: {
        START_DISPATCH: 'Dispatching event from queue',
        GRAPHQL_SUCCESS: 'Event successfully dispatched to GraphQL',
        GRAPHQL_FAIL: 'GraphQL responded with error',
        GRAPHQL_EXCEPTION: 'Exception while calling GraphQL',
    },
    SYSTEM: {
        MISSING_ENV: (name: string) => `Missing required environment variable: ${name}`,
        VALIDATION_FAILED: 'Payload validation failed',
        UNEXPECTED_ERROR: 'Unexpected error',
        NON_ERROR_THROWN: 'Unexpected non-error thrown',
        INTERNAL_SERVER_ERROR: 'Internal server error',
    },
};