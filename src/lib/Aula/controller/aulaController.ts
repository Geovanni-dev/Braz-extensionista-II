import type { Request, Response } from 'express';
import logger from '../../logger.js';
import {
  abrirAula,
  encerrarAula,
  alterarPausa,
  getAulaAberta,
} from '../services/aulaService.js';
import {
  DisciplinaNaoEncontradaError,
  AulaNaoEncontradaError,
} from '../../errors.js';

export const storeAbrirAula = async (req: Request, res: Response) => {
  try {
    const disciplinaId = req.body.disciplinaId;
    if (!disciplinaId) {
      return res.status(400).json({ error: 'Id da disciplina não informada' });
    }
    const aulaAberta = await abrirAula(disciplinaId);
    return res.status(201).json(aulaAberta);
  } catch (error) {
    logger.error(error);
    if (error instanceof DisciplinaNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar a solicitação' });
};

export const storeFecharAula = async (req: Request, res: Response) => {
  try {
    const aulaId = req.params.aulaId;
    if (!aulaId) {
      return res.status(400).json({ error: 'Id da aula não informado' });
    }
    //Express 5 types params as string | string[]
    if (typeof aulaId !== 'string') {
      return res
        .status(400)
        .json({ error: 'O id da aula deve ser uma string' });
    }
    const fecharAula = await encerrarAula(aulaId);
    return res.status(200).json(fecharAula);
  } catch (error) {
    logger.error(error);
    if (error instanceof AulaNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar a solicitação' });
};

export const storePausarAula = async (req: Request, res: Response) => {
  try {
    const { aulaId } = req.params;
    if (!aulaId) {
      return res.status(400).json({ error: 'Aula não encontrada' });
    }
    if (typeof aulaId !== 'string') {
      return res
        .status(400)
        .json({ error: 'O id da aula deve ser uma string' });
    }
    const result = await alterarPausa(aulaId, true);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof AulaNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar a solicitação' });
};

export const storeDespausarAula = async (req: Request, res: Response) => {
  try {
    const { aulaId } = req.params;
    if (!aulaId) {
      return res.status(400).json({ error: 'Aula não encontrada' });
    }
    if (typeof aulaId !== 'string') {
      return res
        .status(400)
        .json({ error: 'O id da aula deve ser uma string' });
    }
    const result = await alterarPausa(aulaId, false);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof AulaNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar a solicitação' });
};

export const indexAulaAberta = async (_req: Request, res: Response) => {
  try {
    const aula = await getAulaAberta();
    if (!aula) {
      return res.status(200).json(null);
    }
    const result = {
      disciplina: aula.disciplina.nome,
      pausada: aula.pausada,
    };
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};

export const indexAulaAtual = async (_req: Request, res: Response) => {
  try {
    const aula = await getAulaAberta();
    if (!aula) {
      return res.status(200).json(null);
    }
    const result = {
      id: aula.id,
      disciplina: aula.disciplina.nome,
      pausada: aula.pausada,
      abertaEm: aula.abertaEm,
    };
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};
