import axios, { AxiosResponse } from 'axios';
import { IncomingEvent, config } from '@/shared';
import logger from '@/shared/utils/logger';

// Define the GraphQL mutation for sending the event
const GRAPHQL_MUTATION = `
    mutation SendEvent($input: EventInput!) {
        sendEvent(input: $input) {
            id
            status
        }
    }
`;

// Type-safe GraphQL response example
type SendEventResponseData = {
    sendEvent: {
        id: string;
        status: string;
    };
};

type GraphQLSuccessResponse = {
    data: SendEventResponseData;
    errors?: Array<{ message: string; extensions?: unknown }>;
};

// Posts a validated event to the GraphQL API
export const postToGraphQL = async (event: IncomingEvent): Promise<void> => {
    const response: AxiosResponse<GraphQLSuccessResponse> = await axios.post(
        config.graphqlEndpoint,
        {
            query: GRAPHQL_MUTATION,
            variables: { input: event },
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.authToken}`,
            },
            timeout: 5000,
        }
    );

    // Check for GraphQL-level errors
    if (response.data.errors) {
        throw new Error(`GraphQL returned errors: ${JSON.stringify(response.data.errors)}`);
    }

    const { id, status } = response.data.data.sendEvent;

    logger.info('GraphQL mutation succeeded', { id, status });
};
