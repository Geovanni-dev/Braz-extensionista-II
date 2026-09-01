import type { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../../logger.js';
import {
  registroSchema,
  loginSchema,
  validarCodigoSchema,
  reenviarEmailSchema,
  trocarSenhaSchema,
} from '../schemas/loginAlunoSchema.js';
import {
  registro,
  login,
  verificarCodigo,
  reenviarCodigo,
  pedirTrocaSenha,
  trocarSenha,
} from '../services/loginAlunoService.js';
import {
  CodigoDaTurmaInvalidoError,
  AlunoNaoEncontradoError,
  CodigoExpiradoError,
  CodigoInvalidoError,
  EmailNaoVerificadoError,
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
    return res.status(200).json({
      message:
        'Se o email estiver cadastrado um código de verificação será enviado, verifique sua caixa de spam',
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'E-mail com formato inválido' });
    }
  }
  return res.status(500).json({ error: 'Error interno do servidor' });
};

export const storeCodigoTrocaSenha = async (req: Request, res: Response) => {
  try {
    const payload = reenviarEmailSchema.parse(req.body);
    await pedirTrocaSenha(payload);
    return res.status(200).json({
      message:
        'Se o email estiver cadastrado um código de verificação será enviado, verifique sua caixa de spam',
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'E-mail com formato inválido' });
    }
  }
  return res.status(500).json({ error: 'Erro ao processar solicitação' });
};

export const storeTrocarSenha = async (req: Request, res: Response) => {
  try {
    const payload = trocarSenhaSchema.parse(req.body);
    await trocarSenha(payload);
    return res.status(200).json({
      message: 'Senha alterada com sucesso, faça login com a nova senha',
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    if (error instanceof AlunoNaoEncontradoError) {
      return res.status(401).json({ error: error.message });
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
