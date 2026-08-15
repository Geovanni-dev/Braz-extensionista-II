import prisma from '../../prisma/prismaClient.js';
import logger from '../../logger.js';
import { AulaNaoEncontradaError } from '../../errors.js';
import { hasChat } from '../../Chat/services/chatCache.js';
import { relatorioService } from '../../Relatorio/services/relatorioService.js';

export const encerrarAula = async (aulaId: string) => {
  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
  });
  if (!aula) {
    throw new AulaNaoEncontradaError('Aula não encontrada');
  }
  if (aula.fechadaEm !== null) {
    return {
      gerados: 0,
      falhas: 0,
    }; /* It returns 0 because if the class is closed, it doesn't return a report; this way,
    I don't need to handle the undefined case in the controller.*/
  }
  await prisma.aula.update({
    where: { id: aulaId },
    data: {
      fechadaEm: new Date(),
    },
  });

  const alunos = await prisma.aluno.findMany();

  /*variables to store the number of generated reports and
  the number of errors encountered during generation*/
  let gerados = 0;
  let falhas = 0;

  for (const aluno of alunos) {
    const temConversa = await hasChat(aulaId, aluno.id); //check which students talked during class
    if (!temConversa) {
      continue;
    }
    try {
      await relatorioService(aulaId, aluno.id);
      gerados++;
    } catch (error) {
      logger.error(error, `Falha ao gerar relatório de ${aluno.nome}`);
      falhas++;
    }
  }
  return { gerados, falhas };
};
