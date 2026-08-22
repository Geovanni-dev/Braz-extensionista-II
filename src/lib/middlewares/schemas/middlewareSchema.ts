import { z } from 'zod';

export const payloadProfessorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3),
  role: z.literal('professor'),
});

export const payloadAlunoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3),
  role: z.literal('aluno'),
});
