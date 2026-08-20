import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../src/lib/logger.js';
import { z } from 'zod';

const prisma = new PrismaClient();

const chaveSchema = z.object({
  CHAVE_MEIRES: z.string(),
  CHAVE_ARIANE: z.string(),
  CHAVE_WESLANE: z.string(),
  CHAVE_LUCIANNE: z.string(),
  CHAVE_HELITA: z.string(),
});

// Seed the professores
async function seedProfessors() {
  try {
    const chaves = chaveSchema.parse(process.env);
    const professorDates = [
      { nome: 'Professora Meires', chave: chaves.CHAVE_MEIRES },
      { nome: 'Professora Ariane', chave: chaves.CHAVE_ARIANE },
      { nome: 'Professora Weslane', chave: chaves.CHAVE_WESLANE },
      { nome: 'Professora Lucianne', chave: chaves.CHAVE_LUCIANNE },
      { nome: 'Professora Helita', chave: chaves.CHAVE_HELITA },
    ];

    // loop through the professorDates array and upsert each professor into the database
    for (const professor of professorDates) {
      const chaveHash = await bcrypt.hash(professor.chave, 10);
      await prisma.professor.upsert({
        where: { nome: professor.nome },
        update: { chave: chaveHash },
        create: { nome: professor.nome, chave: chaveHash },
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
      { nome: 'Língua Portuguesa', professor: 'Professora Meires' },
      { nome: 'Estudo Orientado de Português', professor: 'Professora Meires' },
      { nome: 'Letramento Digital', professor: 'Professora Meires' },

      { nome: 'Ciências', professor: 'Professora Ariane' },
      { nome: 'Geografia', professor: 'Professora Ariane' },

      { nome: 'Matemática', professor: 'Professora Weslane' },
      { nome: 'Inglês', professor: 'Professora Weslane' },
      {
        nome: 'Estudo Orientado de Matemática',
        professor: 'Professora Weslane',
      },
      { nome: 'Pensamento Computacional', professor: 'Professora Weslane' },

      { nome: 'Artes', professor: 'Professora Lucianne' },
      { nome: 'Educação Física', professor: 'Professora Lucianne' },

      { nome: 'História', professor: 'Professora Helita' },
      { nome: 'Eletiva', professor: 'Professora Helita' },
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
  } finally {
    await prisma.$disconnect();
  }
}

await seedProfessors();
await seedDisciplinas();
