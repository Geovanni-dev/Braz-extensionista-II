import prisma from '../../prisma/prismaClient.js';
import logger from '../../logger.js';
import { promptBraz } from '../../prompts/promptSystem.js';
import {
  AlunoNaoEncontradoError,
  AulaNaoEncontradaError,
  IdAlunoNaoEncontradoError,
} from '../../errors.js';
import { getChat, setChat } from './chatCache.js';
import { genAI } from '../../Gemini/client.js';

//------------------AUXILIARY FUNCTIONS

// function to check which class is active
async function getAulaAberta() {
  const aulaAberta = await prisma.aula.findFirst({
    where: { fechadaEm: null },
    include: { disciplina: true },
  });

  if (!aulaAberta) {
    return null;
  }
  logger.info(`Aula aberta encontrada: ${aulaAberta.id}`);
  return aulaAberta;
}

//------------------SERVICE

export const chatService = async (params: { messages: string }) => {
  const aulaAberta = await getAulaAberta();
  if (!aulaAberta) {
    throw new AulaNaoEncontradaError('Aula não encontrada');
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

  const history = await getChat(aulaAberta.id, alunoId);

  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    config: {
      systemInstruction: promptBraz(aulaAberta.disciplina.nome, aluno.nome),
    },
    contents: [
      ...history.slice(-20).map((msg: { role: string; text: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: params.messages }] },
    ],
  });

  await setChat(aulaAberta.id, alunoId, 'user', params.messages);
  await setChat(aulaAberta.id, alunoId, 'model', response.text ?? '');

  return response.text;
};
