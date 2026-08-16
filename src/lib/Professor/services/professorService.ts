import prisma from '../../prisma/prismaClient.js';

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
