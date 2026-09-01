import { z } from 'zod';

export const registroSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caractéres'),
  email: z.string().email({ message: 'O email deve ser válido' }),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caractéres '),
  codigo: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'O email deve ser válido' }),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caractéres '),
});

export const validarCodigoSchema = z.object({
  codigo: z.string().min(6, 'O codigo deve ter pelo menos 6 caracteres'),
  email: z.string().email({ message: 'O email deve ser valido' }),
});

export const reenviarEmailSchema = z.object({
  email: z.string().email(),
});

export const trocarSenhaSchema = z.object({
  email: z.string().email({ message: 'O email deve ser válido' }),
  codigo: z.string().min(6, 'O codigo deve ter pelo menos 6 caracteres'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caractéres '),
});

//---------------Types

export type RegistroValido = z.infer<typeof registroSchema>;
export type LoginValido = z.infer<typeof loginSchema>;
export type CodigoValido = z.infer<typeof validarCodigoSchema>;
export type ReenviarCodigo = z.infer<typeof reenviarEmailSchema>;
export type TrocarSenha = z.infer<typeof trocarSenhaSchema>;
