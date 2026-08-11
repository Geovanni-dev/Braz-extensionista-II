import prisma from '../../prisma/prismaClient.js';
import logger from '../../logger.js';
import { GoogleGenAI } from '@google/genai';
import { promptBraz } from '../prompts/prompt.js';
import {
  AlunoNaoEncontradoError,
  SessaoNaoEncontradaError,
  IdAlunoNaoEncontradoError,
} from '../../errors.js';

// ---------------  GEMINI CLIENT
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    'Chave da API Gemini não encontrada. Verifique a variável de ambiente GEMINI_API_KEY.',
  );
}

const genAI = new GoogleGenAI({ apiKey });

//------------------AUXILIARY FUNCTIONS

// function to check which session is active
async function getSessaoAberta() {
  const sessaoAberta = await prisma.sessao.findFirst({
    where: { fechadaEm: null },
    include: { disciplina: true },
  });

  if (!sessaoAberta) {
    return null;
  }
  logger.info(`Sessão aberta encontrada: ${sessaoAberta.id}`);
  return sessaoAberta;
}

//------------------SERVICE

export const chatService = async (params: {
  messages: string;
  history: { role: string; text: string }[];
}) => {
  const sessaoAberta = await getSessaoAberta();
  if (!sessaoAberta) {
    throw new SessaoNaoEncontradaError('Sessão não encontrada');
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

  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    config: {
      systemInstruction: promptBraz(sessaoAberta.disciplina.nome, aluno.nome),
    },
    contents: [
      ...params.history.slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: params.messages }] },
    ],
  });

  return response.text;
};
