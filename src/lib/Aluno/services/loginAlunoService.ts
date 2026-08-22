import prisma from '../../prisma/prismaClient.js';
import type { LoginValido } from '../schemas/loginAlunoSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { CodigoDaTurmaInvalidoError } from '../../errors.js';

const SECRET = env.JWT_SECRET;
const codigoTurma = env.CODIGO_TURMA;

export const registro = async (payload: LoginValido) => {
  if (payload.codigo !== codigoTurma) {
    throw new CodigoDaTurmaInvalidoError('Código da turma invalido');
  }
  const senhaHash = await bcrypt.hash(payload.senha, 10);
  const aluno = await prisma.aluno.create({
    data: {
      nome: payload.nome,
      email: payload.email,
      senha: senhaHash,
    },
  });
  const token = jwt.sign(
    { id: aluno.id, nome: aluno.nome, role: 'aluno' },
    SECRET,
    {
      expiresIn: '8h',
    },
  );
  return token;
};
