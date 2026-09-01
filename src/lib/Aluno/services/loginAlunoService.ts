import prisma from '../../prisma/prismaClient.js';
import logger from '../../logger.js';
import type {
  RegistroValido,
  LoginValido,
  CodigoValido,
  ReenviarCodigo,
  TrocarSenha,
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
  EmailJaCadastradoError,
} from '../../errors.js';
import {
  enviarCodigoVerificacao,
  enviarCodigoRecuperacao,
  gerarCodigo,
} from '../../service/emailService.js';
import {
  setCodigoCache,
  getCodigoCache,
  deleteCodigoCache,
} from './loginCache.js';
import { Prisma } from '@prisma/client';
import {
  deleteCodigoResetCache,
  getCodigoResetCache,
  setCodigoResetCache,
} from './resetCache.js';

//-------------- configs

const SECRET = env.JWT_SECRET;
const codigoTurma = env.CODIGO_TURMA;

// --------- services

export const registro = async (payload: RegistroValido) => {
  if (payload.codigo !== codigoTurma) {
    throw new CodigoDaTurmaInvalidoError('Código da turma invalido');
  }
  const senhaHash = await bcrypt.hash(payload.senha, 10);
  try {
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new EmailJaCadastradoError('Esse email já está cadastrado');
    }
    throw error;
  }
};

export const verificarCodigo = async (payload: CodigoValido) => {
  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
    select: { id: true, nome: true },
  });
  if (!aluno) {
    throw new AlunoNaoEncontradoError('Código expirado ou inválido');
  }
  const codigoEnviado = await getCodigoCache(aluno.id);
  if (!codigoEnviado) {
    throw new CodigoExpiradoError('Código expirado ou inválido');
  }
  if (codigoEnviado !== payload.codigo) {
    throw new CodigoInvalidoError('Código expirado ou inválido');
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
  return { token };
};

export const login = async (payload: LoginValido) => {
  const HASH_FALSO =
    '$2b$10$C6UzMDM.H6dfI/f/IKcEe.uCwAJgB0lLAdOnFeuVi3rlrLtPzu5Uu';

  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
  });
  if (!aluno) {
    /* Fake comparison so both paths take the same time. Without it, an email that doesn't exist
    answers in 2ms and a real one waits for bcrypt 100ms. That difference is enough to
    discover which emails have an account, even with the same error message. */
    await bcrypt.compare(payload.senha, HASH_FALSO);
    throw new AlunoNaoEncontradoError('Email ou senha incorretos');
  }
  const senhaValida = await bcrypt.compare(payload.senha, aluno.senha);
  if (!senhaValida) {
    throw new SenhaIncorretaError('Email ou senha incorretos');
  }
  if (!aluno.verificado) {
    throw new EmailNaoVerificadoError(
      'Confirme seu email para verificar sua conta',
    );
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

export const reenviarCodigo = async (payload: ReenviarCodigo) => {
  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
    select: { id: true, nome: true, email: true, verificado: true },
  });
  if (!aluno) {
    logger.warn(`Aluno não encontrado com email:${payload.email}`);
    return;
  }
  if (aluno.verificado) {
    logger.warn('Email já verificado');
    return;
  }
  const codigo = gerarCodigo();
  await setCodigoCache(aluno.id, codigo);
  await enviarCodigoVerificacao(aluno.email, codigo, aluno.nome);
};

export const pedirTrocaSenha = async (payload: ReenviarCodigo) => {
  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
    select: { id: true, email: true, nome: true },
  });
  if (!aluno) {
    logger.warn(`Pedido de reset para email inexistente: ${payload.email}`);
    return;
  }
  const codigo = gerarCodigo();
  await setCodigoResetCache(aluno.id, codigo);
  await enviarCodigoRecuperacao(aluno.email, codigo, aluno.nome);
};

export const trocarSenha = async (payload: TrocarSenha) => {
  const aluno = await prisma.aluno.findUnique({
    where: { email: payload.email },
    select: { id: true, nome: true },
  });
  if (!aluno) {
    throw new AlunoNaoEncontradoError('Código expirado ou inválido');
  }
  const codigoEnviado = await getCodigoResetCache(aluno.id);
  if (!codigoEnviado) {
    throw new CodigoExpiradoError('Código expirado ou inválido');
  }
  if (codigoEnviado !== payload.codigo) {
    throw new CodigoInvalidoError('Código expirado ou inválido');
  }
  const senhaNovaHash = await bcrypt.hash(payload.senha, 10);
  await prisma.aluno.update({
    where: { email: payload.email },
    data: { senha: senhaNovaHash },
  });
  await deleteCodigoResetCache(aluno.id);
};
