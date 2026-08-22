import type { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../../logger.js';
import { loginSchema } from '../schemas/loginAlunoSchema.js';
import { registro } from '../services/loginAlunoService.js';
import { CodigoDaTurmaInvalidoError } from '../../errors.js';

export const store = async (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await registro(payload);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    if (error instanceof CodigoDaTurmaInvalidoError) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};
