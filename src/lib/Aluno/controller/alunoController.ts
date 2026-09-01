import type { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../../logger.js';
import {
  registroSchema,
  loginSchema,
  validarCodigoSchema,
  reenviarEmailSchema,
} from '../schemas/loginAlunoSchema.js';
import {
  registro,
  login,
  verificarCodigo,
  reenviarCodigo,
} from '../services/loginAlunoService.js';
import {
  CodigoDaTurmaInvalidoError,
  AlunoNaoEncontradoError,
  CodigoExpiradoError,
  CodigoInvalidoError,
  EmailNaoVerificadoError,
  EmailVerificadoError,
  SenhaIncorretaError,
  EmailJaCadastradoError,
} from '../../errors.js';

export const storeRegistro = async (req: Request, res: Response) => {
  try {
    const payload = registroSchema.parse(req.body);
    await registro(payload);
    return res
      .status(201)
      .json({ message: 'Código de verificação enviado ao seu email' });
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    if (error instanceof CodigoDaTurmaInvalidoError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof EmailJaCadastradoError) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

export const storeVerificarCodigo = async (req: Request, res: Response) => {
  try {
    const payload = validarCodigoSchema.parse(req.body);
    const result = await verificarCodigo(payload);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof CodigoExpiradoError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof CodigoInvalidoError) {
      return res.status(400).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};

export const storeLogin = async (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await login(payload);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof EmailNaoVerificadoError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof SenhaIncorretaError) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

export const storeReenviarCodigo = async (req: Request, res: Response) => {
  try {
    const payload = reenviarEmailSchema.parse(req.body);
    await reenviarCodigo(payload);
    return res
      .status(201)
      .json({ message: 'Código de verificação reenviado ao seu email' });
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof EmailVerificadoError) {
      return res.status(401).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'Error interno do servidor' });
};
