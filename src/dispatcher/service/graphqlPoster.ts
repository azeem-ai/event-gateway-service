import axios, { AxiosResponse } from 'axios';
import { EnrichedEvent, config } from '@/shared';
import logger from '@/shared/utils/logger';

// Define the GraphQL mutation to send event details
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

// Complete GraphQL API response type including possible errors
type GraphQLSuccessResponse = {
    data: SendEventResponseData;
    errors?: Array<{ message: string; extensions?: unknown }>;
};


/**
 * Posts an enriched event to the GraphQL API.
 * @param {EnrichedEvent} event The validated event to send.
 * @return {Promise<void>} Resolves when the event is successfully posted.
 * @throws Throws if GraphQL returns errors or the network request fails.
 */
export const postToGraphQL = async (event: EnrichedEvent): Promise<void> => {
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
