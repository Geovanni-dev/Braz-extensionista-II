import type { Request, Response } from 'express';
import { getProfessor, loginProfessor } from '../services/professorService.js';
import logger from '../../logger.js';
import { CredenciaisInvalidasError } from '../../errors.js';

export const indexProfessor = async (_req: Request, res: Response) => {
  try {
    const result = await getProfessor();
    return res.status(201).json(result);
  } catch (error) {
    logger.error(error);
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};

export const storeLogin = async (req: Request, res: Response) => {
  try {
    const { professorId, chave } = req.body;
    if (!professorId || !chave) {
      return res.status(400).json({ error: 'Credenciais não informadas' });
    }
    const result = await loginProfessor(professorId, chave);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof CredenciaisInvalidasError) {
      return res.status(401).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};
