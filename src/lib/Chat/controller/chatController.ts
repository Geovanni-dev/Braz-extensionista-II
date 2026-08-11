import { type Request, type Response } from 'express';
import { chatService } from '../services/chatService.js';
import logger from '../../logger.js';
import {
  AlunoNaoEncontradoError,
  SessaoNaoEncontradaError,
  IdAlunoNaoEncontradoError,
} from '../../errors.js';

export const storeChat = async (req: Request, res: Response) => {
  try {
    const { messages, history = [] } = req.body;
    if (!messages)
      return res.status(400).json({ error: 'Mensagens não fornecidas' });

    const result = await chatService({ messages, history });
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof IdAlunoNaoEncontradoError) {
      return res.status(500).json({
        error:
          'Id do aluno não encontrado. Verifique a variável de ambiente DEFAULT_ALUNO_ID.',
      });
    }
    if (error instanceof SessaoNaoEncontradaError) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar a solicitação' });
};
