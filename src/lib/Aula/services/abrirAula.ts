import prisma from '../../prisma/prismaClient.js';
import { DisciplinaNaoEncontrada } from '../../errors.js';
import { encerrarAula } from './encerrarAulaService.js';

export const abrirAula = async (disciplinaId: string) => {
  const disciplina = await prisma.disciplina.findUnique({
    where: { id: disciplinaId },
  });
  if (!disciplina) {
    throw new DisciplinaNaoEncontrada('Disciplina não encontrada');
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
