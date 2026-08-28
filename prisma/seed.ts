import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../src/lib/logger.js';
import { z } from 'zod';

const prisma = new PrismaClient();

// zod schemas

const chaveSchema = z.object({
  CHAVE_MEIRES: z.string(),
  CHAVE_ARIANE: z.string(),
  CHAVE_WESLANE: z.string(),
  CHAVE_LUCIANNE: z.string(),
  CHAVE_HELITA: z.string(),
});

const alunoSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  codigo: z.string(),
});

// Seed the professores
async function seedProfessors() {
  try {
    const chaves = chaveSchema.parse(process.env);
    const professorDates = [
      { codigo: 887, nome: 'Meires', chave: chaves.CHAVE_MEIRES },
      { codigo: 998, nome: 'Ariane', chave: chaves.CHAVE_ARIANE },
      { codigo: 455, nome: 'Weslane', chave: chaves.CHAVE_WESLANE },
      { codigo: 300, nome: 'Lucianne', chave: chaves.CHAVE_LUCIANNE },
      { codigo: 674, nome: 'Helita', chave: chaves.CHAVE_HELITA },
    ];

    // loop through the professorDates array and upsert each professor into the database
    for (const professor of professorDates) {
      const chaveHash = await bcrypt.hash(professor.chave, 10);
      await prisma.professor.upsert({
        where: { codigo: professor.codigo },
        update: { chave: chaveHash },
        create: {
          codigo: professor.codigo,
          nome: professor.nome,
          chave: chaveHash,
        },
      });
    }
    return logger.info('Professores criados/atualizados com sucesso.');
  } catch (error) {
    logger.error(error, 'Erro ao criar/atualizar professor.');
  }
}

// Seed the disciplinas
async function seedDisciplinas() {
  try {
    const disciplinaDates = [
      { nome: 'Língua Portuguesa', professor: 'Meires' },
      { nome: 'Estudo Orientado de Português', professor: 'Meires' },
      { nome: 'Letramento Digital', professor: 'Meires' },

      { nome: 'Ciências', professor: 'Ariane' },
      { nome: 'Geografia', professor: 'Ariane' },

      { nome: 'Matemática', professor: 'Weslane' },
      { nome: 'Inglês', professor: 'Weslane' },
      {
        nome: 'Estudo Orientado de Matemática',
        professor: 'Weslane',
      },
      { nome: 'Pensamento Computacional', professor: 'Weslane' },

      { nome: 'Artes', professor: 'Lucianne' },
      { nome: 'Educação Física', professor: 'Lucianne' },

      { nome: 'História', professor: 'Helita' },
      { nome: 'Eletiva', professor: 'Helita' },
    ];

    for (const disciplina of disciplinaDates) {
      await prisma.disciplina.upsert({
        where: { nome: disciplina.nome },
        update: {
          nome: disciplina.nome,
          professor: { connect: { nome: disciplina.professor } },
        },
        create: {
          nome: disciplina.nome,
          professor: { connect: { nome: disciplina.professor } },
        },
      });
    }
    return logger.info('Disciplinas criadas/atualizadas com sucesso.');
  } catch (error) {
    logger.error(error, 'Erro ao criar/atualizar disciplina.');
  }
}

async function seedAluno() {
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
}

await seedProfessors();
await seedDisciplinas();
await seedAluno();
