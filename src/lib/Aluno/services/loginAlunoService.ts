import prisma from '../../prisma/prismaClient.js';
import type {
  RegistroValido,
  LoginValido,
  CodigoValido,
} from '../schemas/loginAlunoSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import {
  CodigoDaTurmaInvalidoError,
  AlunoNaoEncontradoError,
  SenhaIncorretaError,
  CodigoExpiradoError,
  CodigoInvalidoError,
  EmailNaoVerificadoError,
} from '../../errors.js';
import {
  enviarCodigoVerificacao,
  gerarCodigo,
} from '../../service/emailService.js';
import {
  setCodigoCache,
  getCodigoCache,
  deleteCodigoCache,
} from './loginCache.js';

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
  const codigo = gerarCodigo();
  await setCodigoCache(aluno.id, codigo);
  await enviarCodigoVerificacao(aluno.email, codigo, aluno.nome);
};

export const verificarCodigo = async (payload: CodigoValido) => {
  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
    select: { id: true, nome: true },
  });
  if (!aluno) {
    throw new AlunoNaoEncontradoError('Aluno não encontrado');
  }
  const codigoEnviado = await getCodigoCache(aluno.id);
  if (!codigoEnviado) {
    throw new CodigoExpiradoError('Código expirado');
  }
  if (codigoEnviado !== payload.codigo) {
    throw new CodigoInvalidoError('Código inválido');
  }
  await prisma.aluno.update({
    where: { id: aluno.id },
    data: { verificado: true },
  });
  await deleteCodigoCache(aluno.id);
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
  if (!aluno.verificado) {
    throw new EmailNaoVerificadoError('Confirme seu email antes de entrar');
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
