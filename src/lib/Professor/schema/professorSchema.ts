import { z } from 'zod';

export const editarNomeSchema = z.object({
  novoNome: z.string().trim().min(2),
});
