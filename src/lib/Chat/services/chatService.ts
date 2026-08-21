import prisma from '../../prisma/prismaClient.js';
import { promptBraz } from '../../prompts/promptSystem.js';
import {
  AlunoNaoEncontradoError,
  AulaNaoEncontradaError,
  AulaPausadaError,
} from '../../errors.js';
import { getChat, setChat } from './chatCache.js';
import { genAI } from '../../Gemini/client.js';
import { getAulaAberta } from '../../Aula/services/aulaService.js';

//------------------SERVICE

export const chatService = async (params: {
  messages: string;
  alunoId: string;
}) => {
  const aulaAberta = await getAulaAberta();
  if (!aulaAberta) {
    throw new AulaNaoEncontradaError('Aula não encontrada');
  }
  if (aulaAberta.pausada) {
    throw new AulaPausadaError(
      'A professora pausou o chat neste momento. Assim que ela liberar, você pode voltar a perguntar.',
    );
  }
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.alunoId },
  });

  if (!aluno) {
    throw new AlunoNaoEncontradoError('Aluno não encontrado');
  }

  const history = await getChat(aulaAberta.id, aluno.id);

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

  await setChat(aulaAberta.id, aluno.id, 'user', params.messages);
  await setChat(aulaAberta.id, aluno.id, 'model', response.text ?? '');

  return response.text;
};
