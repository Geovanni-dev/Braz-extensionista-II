import prisma from '../src/lib/prisma/prismaClient.js';

const main = async () => {
  const ano = process.argv[2];
  const anoAtual = new Date().getFullYear();

  /* Asking for the year is what stops the command from being repeated out of the
terminal history: in January the old line no longer matches and has to be retyped */
  if (ano !== String(anoAtual)) {
    console.error(`Uso: tsx scripts/limparAnoLetivo.ts ${anoAtual}`);
    console.error(
      'Informe o ano letivo que será apagado para confirmar a operação.',
    );
    process.exit(1);
  }
  const registro = await prisma.$transaction(async (tx) => {
    const relatorios = await tx.relatorio.deleteMany();
    const aulas = await tx.aula.deleteMany();
    const alunos = await tx.aluno.deleteMany();

    const registroDeExclusao = await tx.registroExclusao.create({
      data: {
        tipo: 'ANUAL',
        relatoriosExcluidos: relatorios.count,
        aulasExcluidas: aulas.count,
        alunosExcluidos: alunos.count,
      },
    });
    return registroDeExclusao;
  });
  console.log(
    `Ano letivo limpo. ${registro.relatoriosExcluidos} relatório(s), ` +
      `${registro.aulasExcluidas} aula(s) e ${registro.alunosExcluidos} aluno(s) apagados.`,
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
