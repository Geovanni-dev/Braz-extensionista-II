import prisma from '../../prisma/prismaClient.js';
import { promptRelatorio } from '../../prompts/promptSystem.js';
import {
  AlunoNaoEncontradoError,
  AulaNaoEncontradaError,
  IdAlunoNaoEncontradoError,
  HistoricoNaoEncontradoError,
} from '../../errors.js';
import { getChat } from '../../Chat/services/chatCache.js';
import { genAI } from '../../Gemini/client.js';

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

  return response.text;
};
