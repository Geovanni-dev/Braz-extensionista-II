import { z } from 'zod';

export const relatorioSchema = z.object({
  temas: z.array(z.string()).max(5),
  esclarecida: z.enum(['SIM', 'PARCIAL', 'NAO']),
  observacoes: z.string().min(1),
});

export type RelatorioGerado = z.infer<typeof relatorioSchema>;
