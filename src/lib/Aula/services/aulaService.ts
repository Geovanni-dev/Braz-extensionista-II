import prisma from '../../prisma/prismaClient.js';
import {
  DisciplinaNaoEncontradaError,
  AulaNaoEncontradaError,
} from '../../errors.js';
import logger from '../../logger.js';
import { hasChat } from '../../Chat/services/chatCache.js';
import { relatorioService } from '../../Relatorio/services/relatorioService.js';

//-------- services

export const abrirAula = async (disciplinaId: string) => {
  const disciplina = await prisma.disciplina.findUnique({
    where: { id: disciplinaId },
  });
  if (!disciplina) {
    throw new DisciplinaNaoEncontradaError('Disciplina não encontrada');
  }
  const aulaAberta = await prisma.aula.findFirst({
    where: { fechadaEm: null },
  });
  if (aulaAberta) {
    await encerrarAula(aulaAberta.id);
  }
  const iniciarAula = await prisma.aula.create({
    data: {
      disciplinaId,
    },
  });
  return iniciarAula;
};

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

export const alterarPausa = async (aulaId: string, pausada: boolean) => {
  const aula = await prisma.aula.findUnique({
    where: {
      id: aulaId,
      fechadaEm: null,
    },
  });
  if (!aula) {
    throw new AulaNaoEncontradaError('Aula não encontrada ou já foi encerrada');
  }
  const pausarAula = await prisma.aula.update({
    where: { id: aulaId },
    data: { pausada },
  });
  return pausarAula;
};

export const getAulaAberta = async () => {
  const aulaAberta = await prisma.aula.findFirst({
    where: { fechadaEm: null },
    include: {
      disciplina: {
        select: {
          nome: true,
          professor: { select: { nome: true } },
        },
      },
    },
  });

  if (!aulaAberta) {
    return null;
  }
  logger.info(`Aula aberta encontrada: ${aulaAberta.id}`);
  return aulaAberta;
};

export const getAula = async () => {
  const aulas = await prisma.aula.findMany({
    select: {
      id: true,
      disciplina: {
        select: { nome: true },
      },
      abertaEm: true,
      fechadaEm: true,
    },
    orderBy: { abertaEm: 'desc' },
    take: 15,
  });
  return aulas;
};
