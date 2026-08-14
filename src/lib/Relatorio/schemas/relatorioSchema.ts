import { z } from 'zod';

export const relatorioSchema = z.object({
  temas: z.array(z.string()).max(5),
  esclarecida: z.enum(['SIM', 'PARCIAL', 'NAO']),
  observacoes: z.string().min(1),
});

// saida da IA, ainda nao persistida (o tipo Relatorio do Prisma e a linha do banco)
export type RelatorioGerado = z.infer<typeof relatorioSchema>;
