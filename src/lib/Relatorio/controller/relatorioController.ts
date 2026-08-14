import type { Request, Response } from 'express';
import logger from '../../logger.js';
import {
  AlunoNaoEncontradoError,
  AulaNaoEncontradaError,
  IdAlunoNaoEncontradoError,
  HistoricoNaoEncontradoError,
} from '../../errors.js';

import { relatorioService } from '../services/relatorioService.js';

export const storeRelatorio = async (req: Request, res: Response) => {
  try {
    const aulaId = req.params.aulaId;
    if (!aulaId) {
      return res.status(400).json({ error: 'ID da aula não fornecido' });
    }
    //Express 5 types params as string | string[]
    if (typeof aulaId !== 'string') {
      return res
        .status(400)
        .json({ error: 'ID da aula deve ser uma string valida' });
    }
    const result = await relatorioService(aulaId);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof AulaNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof IdAlunoNaoEncontradoError) {
      return res.status(500).json({
        error: error.message,
      });
    }
    if (error instanceof HistoricoNaoEncontradoError) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro ao processar a solicitação' });
  }
};
