// Load and validate environment variables
const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

// Central place to manage environment-dependent config
export const config = {
    sqsQueueUrl: requireEnv('SQS_QUEUE_URL'),
    graphqlEndpoint: requireEnv('GRAPHQL_ENDPOINT'),
    logLevel: process.env.LOG_LEVEL ?? 'info',
};
