import type { Request, Response } from 'express';
import logger from '../../logger.js';
import { abrirAula } from '../services/abrirAula.js';
import {
  DisciplinaNaoEncontrada,
  AulaNaoEncontradaError,
} from '../../errors.js';
import { encerrarAula } from '../services/encerrarAulaService.js';

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
    if (error instanceof DisciplinaNaoEncontrada) {
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
