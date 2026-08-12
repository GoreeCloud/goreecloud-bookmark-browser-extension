import { z } from 'zod';

export const optionsFormSchema = z
  .object({
    baseUrl: z
      .string()
      .url('Enter a valid URL')
      .refine((value) => new URL(value).protocol === 'https:', {
        message: 'GoreeCloud Bookmarks requires HTTPS.',
      }),
    username: z.string(),
    password: z.string(),
    syncBookmarks: z.boolean().default(false),
    defaultCollection: z.string().optional().default('Unorganized'),
    apiKey: z.string().optional(),
    method: z.enum(['username', 'apiKey']).default('username'),
  })
  .superRefine((values, context) => {
    if (values.method === 'username') {
      if (!values.username.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter your username or email address.',
          path: ['username'],
        });
      }
      if (!values.password) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter your password.',
          path: ['password'],
        });
      }
      return;
    }

    if (!values.apiKey?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter an API key.',
        path: ['apiKey'],
      });
    }
  });

export type optionsFormValues = z.infer<typeof optionsFormSchema>;
