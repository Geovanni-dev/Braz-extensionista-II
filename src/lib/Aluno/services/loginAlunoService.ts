import prisma from '../../prisma/prismaClient.js';
import type {
  RegistroValido,
  LoginValido,
} from '../schemas/loginAlunoSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import {
  CodigoDaTurmaInvalidoError,
  AlunoNaoEncontradoError,
  SenhaIncorretaError,
} from '../../errors.js';

//-------------- configs

const SECRET = env.JWT_SECRET;
const codigoTurma = env.CODIGO_TURMA;

// --------- services

export const registro = async (payload: RegistroValido) => {
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

export const login = async (payload: LoginValido) => {
  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
  });
  if (!aluno) {
    throw new AlunoNaoEncontradoError('Email ou senha incorretos');
  }
  const senhaValida = await bcrypt.compare(payload.senha, aluno.senha);
  if (!senhaValida) {
    throw new SenhaIncorretaError('Email ou senha incorretos');
  }
  const { senha: _senha, ...resto } = aluno;

  const token = jwt.sign(
    { id: aluno.id, nome: aluno.nome, role: 'aluno' },
    SECRET,
    {
      expiresIn: '8h',
    },
  );
  return { token, aluno: resto };
};
