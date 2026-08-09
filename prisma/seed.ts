import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../src/lib/logger.js';

const prisma = new PrismaClient();

// Seed the professores
async function seedProfessors() {
  try {
    const professorDates = [
      { nome: 'Professora Meires', chave: '426$13aD' },
      { nome: 'Professora Ariane', chave: '426e13a3' },
      { nome: 'Professora Weslane', chave: '426$13aP' },
      { nome: 'Professora Lucianne', chave: '426$13aB' },
      { nome: 'Professora Helita', chave: '426$13a7' },
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
