import prisma from '../../prisma/prismaClient.js';
import { CredenciaisInvalidasError } from '../../errors.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

const SECRET = env.JWT_SECRET;

// ======== SERVICES

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
  const token = jwt.sign({ id: professora.id, nome: professora.nome }, SECRET, {
    expiresIn: '8h',
  });
  return { token };
};
