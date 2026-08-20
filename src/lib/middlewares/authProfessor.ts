import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { ChaveSecretaNaoEncontradaError } from '../errors.js';
import { z } from 'zod';

const payloadSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3),
});

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new ChaveSecretaNaoEncontradaError(
    'Chave secreta não definida no .env',
  );
}

export const authMiddleware = async (
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
