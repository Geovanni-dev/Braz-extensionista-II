import { type Request, type Response } from 'express';
import { chatService } from '../services/chatService.js';
import logger from '../../logger.js';
import {
  AlunoNaoEncontradoError,
  AulaNaoEncontradaError,
  IdAlunoNaoEncontradoError,
  AulaPausadaError,
} from '../../errors.js';

export const storeChat = async (req: Request, res: Response) => {
  try {
    const alunoId =
      (req.headers['x-aluno-id'] as string) ||
      (process.env.DEFAULT_ALUNO_ID as string);
    if (!alunoId) {
      return res.status(401).json({ error: 'Id do aluno não fornecido' });
    }
    const { messages } = req.body;
    if (!messages)
      return res.status(400).json({ error: 'Mensagens não fornecidas' });

    const result = await chatService({ messages, alunoId });
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof AulaPausadaError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof IdAlunoNaoEncontradoError) {
      return res.status(500).json({
        error: error.message,
      });
    }
    if (error instanceof AulaNaoEncontradaError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(404).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar a solicitação' });
};
