import { z } from 'zod';

// Schema for validating the incoming event payload
export const IncomingEventSchema = z.object({
    id: z.string(),
    name: z.string(),
    body: z.string(),
    timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid timestamp format",
    }),
});

// Derive TS type from schema for type safety
export type IncomingEvent = z.infer<typeof IncomingEventSchema>;

// Extended schema with enrichment
export const EnrichedEventSchema = IncomingEventSchema.extend({
    brand: z.string(),
});

// Derived enriched event type
export type EnrichedEvent = z.infer<typeof EnrichedEventSchema>;
