import prisma from '../../prisma/prismaClient.js';
import { promptRelatorio } from '../../prompts/promptSystem.js';
import {
  AlunoNaoEncontradoError,
  AulaNaoEncontradaError,
  IdAlunoNaoEncontradoError,
  HistoricoNaoEncontradoError,
  RelatorioNaoEncontradoError,
  RelatorioInvalidoError,
} from '../../errors.js';
import { getChat, deleteChat } from '../../Chat/services/chatCache.js';
import { genAI } from '../../Gemini/client.js';
import { relatorioSchema } from '../schemas/relatorioSchema.js';

//------------------SERVICE

export const relatorioService = async (aulaId: string) => {
  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    include: { disciplina: true },
  });

  if (!aula) {
    throw new AulaNaoEncontradaError('Aula nao encontrada');
  }

  const alunoId = process.env.DEFAULT_ALUNO_ID; //using a fixed ID from a test user until the student user routes are built

  if (!alunoId) {
    throw new IdAlunoNaoEncontradoError(
      'Id do aluno não encontrado. Verifique a variável de ambiente DEFAULT_ALUNO_ID.',
    );
  }
  const aluno = await prisma.aluno.findUnique({
    where: { id: alunoId },
  });

  if (!aluno) {
    throw new AlunoNaoEncontradoError('Aluno não encontrado');
  }

  const history = await getChat(aulaId, alunoId);
  if (history.length === 0) {
    throw new HistoricoNaoEncontradoError('Nenhuma conversa encontrada');
  } // arrive early to avoid calling the LLM unnecessarily
  const transcricao = history
    .map(
      (msg: { role: string; text: string }) =>
        `${msg.role === 'user' ? 'Aluno' : 'Braz'}: ${msg.text}`,
    )
    .join('\n');

  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    config: {
      systemInstruction: promptRelatorio(aula.disciplina.nome, aluno.nome),
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          temas: { type: 'ARRAY', items: { type: 'STRING' } },
          esclarecida: { type: 'STRING', enum: ['SIM', 'PARCIAL', 'NAO'] },
          observacoes: { type: 'STRING' },
        },
        required: ['temas', 'esclarecida', 'observacoes'],
      },
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: `<conversa>\n${transcricao}\n</conversa>` }],
      },
    ],
  });
  if (!response.text) {
    throw new RelatorioNaoEncontradoError('Relatório não gerado');
  }
  const relatorio = JSON.parse(response.text);
  const validRelatorio = relatorioSchema.safeParse(relatorio);
  if (!validRelatorio.success) {
    throw new RelatorioInvalidoError('Relatório nao gerado');
  }

  const createRelatorio = await prisma.relatorio.create({
    data: {
      ...validRelatorio.data,
      aulaId,
      alunoId,
    },
  });

  /* delete the chat key from Redis only after saving the report to Postgres, preventing the conversation history from being erased—and the report for that class from being lost—in the event of a database save error.*/
  await deleteChat(aulaId, alunoId);

  return createRelatorio;
};
