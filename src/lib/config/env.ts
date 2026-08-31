import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string(),
  JWT_SECRET: z.string().min(1),
  CODIGO_TURMA: z.string(),
  BREVO_EMAIL: z.string().email(),
  BREVO_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
