import prisma from '../src/lib/prisma/prismaClient.js';

const main = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: tsx scripts/excluirAluno.ts <email>');
    process.exit(1);
  }
  const aluno = await prisma.aluno.findUnique({
    where: { email },
  });
  if (!aluno) {
    console.error('Aluno não encontrado');
    process.exit(1);
  }
  const registro = await prisma.$transaction(async (tx) => {
    const relatorios = await tx.relatorio.deleteMany({
      where: { alunoId: aluno.id },
    });
    await tx.aluno.delete({
      where: { id: aluno.id },
    });
    /*the record keeps no name or email on purpose, it exists to prove the deletion
    happened, and keeping a list of deleted students would defeat the deletion itself */
    return tx.registroExclusao.create({
      data: {
        tipo: 'INDIVIDUAL',
        relatoriosExcluidos: relatorios.count,
        aulasExcluidas: 0,
        alunosExcluidos: 1,
      },
    });
  });

  console.log(
    `Aluno ${email} excluído. ${registro.relatoriosExcluidos} relatório(s) apagado(s).`,
  );
  console.log(
    `Registro ${registro.id} em ${registro.executadoEm.toLocaleString('pt-BR')}.`,
  );
};

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
