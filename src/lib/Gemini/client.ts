import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    'Chave da API Gemini não encontrada. Verifique a variável de ambiente GEMINI_API_KEY.',
  );
}

export const genAI = new GoogleGenAI({ apiKey });
