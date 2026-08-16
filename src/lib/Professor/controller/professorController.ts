import type { Request, Response } from 'express';
import { getProfessor } from '../services/professorService.js';
import logger from '../../logger.js';

export const indexProfessor = async (_req: Request, res: Response) => {
  try {
    const result = await getProfessor();
    return res.status(201).json(result);
  } catch (error) {
    logger.error(error);
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};
