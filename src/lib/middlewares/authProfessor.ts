import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';

//------ schema zod
const payloadSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3),
  role: z.literal('professor'),
});

export const SECRET = env.JWT_SECRET;

export const authMiddlewareProfessor = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    const payloadValidado = payloadSchema.parse(payload);
    req.professor = {
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
