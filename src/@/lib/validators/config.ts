import { z } from 'zod';

export const configSchema = z.object({
  baseUrl: z.string(),
  defaultCollection: z.string().optional().default('Unorganized'),
  apiKey: z.string(),
  syncBookmarks: z.boolean().optional().default(false),
  authSource: z.enum(['session', 'apiKey', 'legacy']).nullable().default(null),
  sessionName: z.string().optional(),
});

export type configType = z.infer<typeof configSchema>;
