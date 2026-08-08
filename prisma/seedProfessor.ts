import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../src/lib/logger.js';

const prisma = new PrismaClient();

export async function seedProfessors() {
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
  } finally {
    await prisma.$disconnect();
  }
}
