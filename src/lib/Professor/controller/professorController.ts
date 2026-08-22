import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  getProfessor,
  loginProfessor,
  updateNome,
  getDisciplina,
} from '../services/professorService.js';
import logger from '../../logger.js';
import {
  CredenciaisInvalidasError,
  ProfessoraNaoEncontradaError,
} from '../../errors.js';
import { editarNomeSchema } from '../schemas/professorSchema.js';

// CONTROLLERS
export const indexProfessor = async (_req: Request, res: Response) => {
  try {
    const result = await getProfessor();
    return res.status(200).json(result);
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

export const updateProfessorNome = async (req: Request, res: Response) => {
  try {
    const { novoNome } = editarNomeSchema.parse(req.body);
    const professorId = req.professor?.id;
    if (!professorId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const result = await updateNome(professorId, novoNome);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Nome inválido' });
    }
    if (error instanceof ProfessoraNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res
        .status(409)
        .json({ error: 'Já existe uma professora com esse nome' });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};

export const indexDisciplina = async (req: Request, res: Response) => {
  try {
    const professorId = req.professor?.id;
    if (!professorId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const result = await getDisciplina(professorId);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};
