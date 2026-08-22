import prisma from '../../prisma/prismaClient.js';
import {
  CredenciaisInvalidasError,
  ProfessoraNaoEncontradaError,
} from '../../errors.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

//--------- config

const SECRET = env.JWT_SECRET;

//---------------services

export const getProfessor = async () => {
  const professor = await prisma.professor.findMany({
    select: {
      nome: true,
      id: true,
    } /* filtered to avoid returning all information about the teachers,
    including each one's access key */,
  });
  return professor;
};

export const loginProfessor = async (professorId: string, chave: string) => {
  const professora = await prisma.professor.findUnique({
    where: { id: professorId },
  });
  if (!professora) {
    throw new CredenciaisInvalidasError('Credenciais inválidas');
  }
  const chaveCorreta = await bcrypt.compare(chave, professora.chave);
  if (!chaveCorreta) {
    throw new CredenciaisInvalidasError('Credenciais inválidas');
  }
  const token = jwt.sign(
    { id: professora.id, nome: professora.nome, role: 'professor' },
    SECRET,
    {
      expiresIn: '8h',
    },
  );
  return { token };
};

export const updateNome = async (professorId: string, nome: string) => {
  const professora = await prisma.professor.findUnique({
    where: {
      id: professorId,
    },
  });
  if (!professora) {
    throw new ProfessoraNaoEncontradaError('Professora não encontrada');
  }
  const professoraAtualizada = await prisma.professor.update({
    where: { id: professorId },
    data: { nome },
    select: { id: true, nome: true },
  });
  return professoraAtualizada;
};

export const getDisciplina = async (professorId: string) => {
  const disciplinas = await prisma.disciplina.findMany({
    where: { professorId },
    select: {
      id: true,
      nome: true,
    },
  });
  return disciplinas;
};
