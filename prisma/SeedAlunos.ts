import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../src/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();

//------------------------------------- zod

const alunoSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
});

//------------------------------- seed

const seed = async () => {
  try {
    const { nome, email, senha } = alunoSchema.parse({
      nome: process.env.ALUNO_NAME,
      email: process.env.ALUNO_EMAIL,
      senha: process.env.ALUNO_PASSWORD,
    });
    logger.info('Dados validados pelo esquema do zod:');

    const passwordHash = await bcrypt.hash(senha, 10);

    const aluno = await prisma.aluno.upsert({
      where: { email },
      update: { nome, senha: passwordHash },
      create: {
        nome,
        email,
        senha: passwordHash,
      },
    });
    logger.info(
      `Usuário criado/atualizado com sucesso: ${aluno.nome} (${aluno.email})`,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Erro de validação do zod:');
    } else {
      logger.error('Erro ao criar o usuário:');
    }
  } finally {
    await prisma.$disconnect();
  }
};

seed();
