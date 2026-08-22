import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { payloadAlunoSchema } from '../schemas/middlewareSchema.js';
import { env } from '../../config/env.js';

//------- configs

const SECRET = env.JWT_SECRET;

// -------- middleware

export const authMiddlewareAluno = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    const payloadValidado = payloadAlunoSchema.parse(payload);
    req.aluno = {
      id: payloadValidado.id,
      nome: payloadValidado.nome,
    };
    return next();
  } catch {
    return res.status(401).json({
      error: 'Token Invalido',
    });
  }
};
